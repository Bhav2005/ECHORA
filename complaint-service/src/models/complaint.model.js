class Complaint {
  constructor({ id, category, department, building, content, evidenceUrl, tokenMessage, tokenSignature, mailboxId, status, previousHash, blockHash, createdAt }) {
    this.id = id;
    this.category = category;
    this.department = department;
    this.building = building;
    this.content = content;
    this.evidenceUrl = evidenceUrl;
    this.tokenMessage = tokenMessage;
    this.tokenSignature = tokenSignature;
    this.mailboxId = mailboxId;
    this.status = status || 'PENDING';
    this.previousHash = previousHash;
    this.blockHash = blockHash;
    this.createdAt = createdAt || new Date();
  }

  static fromRow(row) {
    return new Complaint({
      id: row.id,
      category: row.category,
      department: row.department,
      building: row.building,
      content: row.content,
      evidenceUrl: row.evidence_url,
      tokenMessage: row.token_message,
      tokenSignature: row.token_signature,
      mailboxId: row.mailbox_id,
      status: row.status,
      previousHash: row.previous_hash,
      blockHash: row.block_hash,
      createdAt: row.created_at,
    });
  }
}

module.exports = Complaint;
