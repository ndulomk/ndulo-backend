import db from '@/config/database';

export const sessionRepository = {
  async createSession(userId: string, token: string, ipAddress: string, userAgent: string, deviceInfo: object, expiresAt: Date) {
    await db.query(
      `INSERT INTO sessoes_usuarios (user_id, token, ip_address, user_agent, device_info, expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, token, ipAddress, userAgent, JSON.stringify(deviceInfo), expiresAt]
    );
  },

  async deleteSession(userId: string, token: string) {
    await db.query(
      `DELETE FROM sessoes_usuarios WHERE user_id = $1 AND token = $2`,
      [userId, token]
    );
  },

  async findValidSession(userId: string, token: string) {
    const query = `
      SELECT * FROM sessoes_usuarios 
      WHERE user_id = $1 
      AND token = $2 
      AND expires_at > NOW()
    `;
    const result = await db.query(query, [userId, token]);
    return result.rows[0] || null;
  },

  async updateLastActivity(userId: string, token: string) {
    await db.query(
      `UPDATE sessoes_usuarios 
       SET ultima_atividade_em = NOW() 
       WHERE user_id = $1 AND token = $2`,
      [userId, token]
    );
  },
};
