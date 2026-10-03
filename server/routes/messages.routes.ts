import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.ts';
import { requireAuth, sanitizeUser, containsAbusiveContent, type AuthenticatedRequest } from '../auth.ts';
import type { Message, Conversation } from '../../src/types/index.ts';

export const messagesRouter = Router();

// GET /api/conversations - List all conversations for the authenticated user
messagesRouter.get('/conversations', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const data = db.getData();

    // Find blocks
    const blocks = data.blocks.filter(b => b.blockerId === userId || b.blockedUserId === userId);
    const blockedUserIds = new Set(blocks.map(b => b.blockerId === userId ? b.blockedUserId : b.blockerId));

    // Get conversations where user is a participant
    const userConvs = data.conversations
      .filter(c => c.participantIds.includes(userId))
      .filter(c => {
        const otherId = c.participantIds.find(id => id !== userId);
        return otherId && !blockedUserIds.has(otherId);
      });

    // Populate other user and unread count
    const enriched = userConvs.map(conv => {
      const otherId = conv.participantIds.find(id => id !== userId);
      const otherUser = data.users.find(u => u.id === otherId);

      const unreadCount = data.messages.filter(m =>
        m.conversationId === conv.id &&
        m.receiverId === userId &&
        !m.read
      ).length;

      return {
        ...conv,
        otherUser: otherUser ? sanitizeUser(otherUser, false) : undefined,
        unreadCount
      };
    });

    // Sort by most recently updated
    enriched.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    res.json({ conversations: enriched });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to retrieve conversations.' });
  }
});

// GET /api/conversations/:id/messages - Get messages in a conversation
messagesRouter.get('/conversations/:id/messages', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const convId = req.params.id;
    const data = db.getData();

    const conv = data.conversations.find(c => c.id === convId);
    if (!conv || !conv.participantIds.includes(userId)) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    const otherId = conv.participantIds.find(id => id !== userId);
    const otherUser = data.users.find(u => u.id === otherId);

    // Mark messages sent to this user as read
    let markedCount = 0;
    data.messages.forEach(m => {
      if (m.conversationId === convId && m.receiverId === userId && !m.read) {
        m.read = true;
        markedCount++;
      }
    });

    if (markedCount > 0) {
      db.save();
    }

    const messages = data.messages
      .filter(m => m.conversationId === convId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json({
      conversation: conv,
      otherUser: otherUser ? sanitizeUser(otherUser, false) : undefined,
      messages
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to retrieve messages.' });
  }
});

// POST /api/messages/send - Send a message
messagesRouter.post('/send', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const sender = req.user!;
    const { recipientId, conversationId, text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Message text cannot be empty.' });
      return;
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 1000) {
      res.status(400).json({ error: 'Message exceeds maximum length of 1000 characters.' });
      return;
    }

    // Anti-abuse filter
    if (containsAbusiveContent(trimmedText)) {
      res.status(400).json({
        error: 'Your message could not be sent because it violates our Adult Community Safety & Anti-Harassment Guidelines.'
      });
      return;
    }

    const data = db.getData();

    // Determine target recipient
    let targetRecipientId = recipientId;
    let conv: Conversation | undefined;

    if (conversationId) {
      conv = data.conversations.find(c => c.id === conversationId);
      if (!conv || !conv.participantIds.includes(sender.id)) {
        res.status(404).json({ error: 'Conversation not found.' });
        return;
      }
      targetRecipientId = conv.participantIds.find(id => id !== sender.id);
    }

    if (!targetRecipientId) {
      res.status(400).json({ error: 'Recipient ID is required.' });
      return;
    }

    if (targetRecipientId === sender.id) {
      res.status(400).json({ error: 'You cannot send a message to yourself.' });
      return;
    }

    // Check if either party blocked the other
    const isBlocked = data.blocks.some(
      b => (b.blockerId === sender.id && b.blockedUserId === targetRecipientId) ||
           (b.blockerId === targetRecipientId && b.blockedUserId === sender.id)
    );

    if (isBlocked) {
      res.status(403).json({ error: 'Unable to send message to this user.' });
      return;
    }

    const recipient = data.users.find(u => u.id === targetRecipientId);
    if (!recipient || recipient.status !== 'active') {
      res.status(404).json({ error: 'The recipient profile is not available.' });
      return;
    }

    // Find or create conversation
    if (!conv) {
      conv = data.conversations.find(c =>
        c.participantIds.includes(sender.id) && c.participantIds.includes(targetRecipientId)
      );

      if (!conv) {
        conv = {
          id: `conv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          participantIds: [sender.id, targetRecipientId],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        data.conversations.push(conv);
      }
    }

    const nowIso = new Date().toISOString();
    const newMessage: Message = {
      id: `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      conversationId: conv.id,
      senderId: sender.id,
      receiverId: targetRecipientId,
      text: trimmedText,
      createdAt: nowIso,
      read: false
    };

    data.messages.push(newMessage);
    conv.updatedAt = nowIso;
    conv.lastMessage = {
      text: trimmedText,
      createdAt: nowIso,
      senderId: sender.id
    };

    sender.lastActive = 'Online';
    db.save();

    // If recipient is a demo profile, simulate an interactive reply after a short delay
    if (recipient.isDemo) {
      setTimeout(() => {
        try {
          const freshData = db.getData();
          const targetConv = freshData.conversations.find(c => c.id === conv?.id);
          if (!targetConv) return;

          const demoReplies: Record<string, string[]> = {
            'Architecture': [
              "Thanks for reaching out! I love finding people who appreciate good architecture and quiet city spots.",
              "Nice to hear from you! What's your favorite neighbourhood to walk through?"
            ],
            'Foodie': [
              "Hey there! Always great to meet someone new. Any favorite dinner spots you recommend?",
              "Hi! Appreciate the message. Have you tried any good cafes lately?"
            ],
            'Default': [
              "Hey! Thanks for connecting. How is your week going?",
              "Hello! Nice to meet you here. What kind of places do you usually like to hang out at?"
            ]
          };

          const category = recipient.interests[0] || 'Default';
          const replies = demoReplies[category] || demoReplies['Default'];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];

          const replyMessage: Message = {
            id: `msg_reply_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
            conversationId: targetConv.id,
            senderId: recipient.id,
            receiverId: sender.id,
            text: randomReply,
            createdAt: new Date().toISOString(),
            read: false
          };

          freshData.messages.push(replyMessage);
          targetConv.updatedAt = new Date().toISOString();
          targetConv.lastMessage = {
            text: randomReply,
            createdAt: new Date().toISOString(),
            senderId: recipient.id
          };

          db.save();
        } catch (e) {
          // ignore async demo reply errors
        }
      }, 1500);
    }

    res.status(201).json({
      message: newMessage,
      conversationId: conv.id
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// DELETE /api/conversations/:id/unmatch - Unmatch and remove conversation
messagesRouter.delete('/conversations/:id/unmatch', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const convId = req.params.id;
    const data = db.getData();

    const convIndex = data.conversations.findIndex(c => c.id === convId && c.participantIds.includes(userId));
    if (convIndex === -1) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    // Delete conversation and its messages
    data.conversations.splice(convIndex, 1);
    data.messages = data.messages.filter(m => m.conversationId !== convId);

    db.save();
    res.json({ message: 'Conversation unmatched and removed successfully.' });
  } catch (err) {
    console.error('Unmatch error:', err);
    res.status(500).json({ error: 'Failed to unmatch.' });
  }
});
