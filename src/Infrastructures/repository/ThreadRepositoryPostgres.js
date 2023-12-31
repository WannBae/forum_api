const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AddedThread = require("../../Domains/threads/entities/AddedThread");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._db = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;

    const threadId = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner",
      values: [threadId, title, body, createdAt, owner],
    };

    const { rows } = await this._db.query(query);

    return new AddedThread(rows[0]);
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT threads.id,
            threads.title,
            threads.body,
            threads.date,
            users.username
            FROM threads
            LEFT JOIN users ON threads.owner = users.id
            WHERE threads.id = $1`,
      values: [threadId],
    };

    const { rows, rowCount } = await this._db.query(query);

    if (!rowCount) {
      throw new NotFoundError("Thread Not Found");
    }

    return rows[0];
  }

  async verifyAvailableThread(threadId) {
    const query = {
      text: "SELECT 1 FROM threads WHERE id = $1",
      values: [threadId],
    };

    const { rowCount } = await this._db.query(query);

    if (!rowCount) {
      throw new NotFoundError("Thread Not Found");
    }

    return rowCount;
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.*, users.username
            FROM replies
            LEFT JOIN comments ON replies.comment_id = comments.id
            LEFT JOIN users ON replies.owner = users.id
            WHERE comments.thread_id = $1
            ORDER BY replies.date ASC`,
      values: [threadId],
    };

    const { rows } = await this._db.query(query);

    return rows;
  }
}

module.exports = ThreadRepositoryPostgres;
