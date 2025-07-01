import { Db } from 'mongodb';

module.exports = {
  async up(db: Db) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    //email:1 berarti index ini akan mengurutkan berdasarkan email
  },
};
