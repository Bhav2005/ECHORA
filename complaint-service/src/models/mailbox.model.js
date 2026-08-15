class MailboxMessage {
  constructor({ id, mailboxId, sender, content, createdAt }) {
    this.id = id;
    this.mailboxId = mailboxId;
    this.sender = sender; // 'ADMIN' or 'USER'
    this.content = content;
    this.createdAt = createdAt || new Date();
  }

  static fromRow(row) {
    return new MailboxMessage({
      id: row.id,
      mailboxId: row.mailbox_id,
      sender: row.sender,
      content: row.content,
      createdAt: row.created_at,
    });
  }
}

module.exports = MailboxMessage;
