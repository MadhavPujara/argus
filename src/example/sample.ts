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
  // Should trigger: missing prometheusLabels
  async badQuery1() {
    return this.query('SELECT * FROM users');
  }

  // Should trigger: missing query in prometheusLabels
  async badQuery2() {
    return this.query('SELECT * FROM users', {
      prometheusLabels: {}
    });
  }

  // Should trigger: wrong query identifier
  async badQuery3() {
    return this.query('SELECT * FROM users', {
      prometheusLabels: {
        query: 'wrong_identifier'
      }
    });
  }

  // Should pass: exact match with queryIdentifier
  async goodQuery() {
    return this.query('SELECT * FROM users', {
      prometheusLabels: {
        query: 'get_users' // Must match queryIdentifier in .code-review.json
      }
    });
  }
} 