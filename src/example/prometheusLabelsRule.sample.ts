interface QueryConfig {
  prometheusLabels?: {
    query?: string;
  };
}

class Database {
  async query(sql: string, config?: QueryConfig): Promise<any> {
    return Promise.resolve([]);
  }
}

class iRevBase extends Database {
  // Example: missing prometheusLabels - commented out to avoid pre-commit failures
  // async badQuery1() {
  //   return this.query('SELECT * FROM users');
  // }

  // Example: missing query in prometheusLabels - commented out to avoid pre-commit failures
  // async badQuery2() {
  //   return this.query('SELECT * FROM users', {
  //     prometheusLabels: {}
  //   });
  // }

  // Example: wrong query identifier - commented out to avoid pre-commit failures
  // async badQuery3() {
  //   return this.query('SELECT * FROM users', {
  //     prometheusLabels: {
  //       query: 'wrong_identifier'
  //     }
  //   });
  // }

  // Valid example: exact match with queryIdentifier
  async getUsers() {
    return this.query('SELECT * FROM users', {
      prometheusLabels: {
        query: 'get_users' // Matches queryIdentifier in .code-review.json
      }
    });
  }
} 