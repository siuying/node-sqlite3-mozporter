var expect = require('chai').expect;
var sqlite3 = require('sqlite3');
var mozporter = require('../');

describe('sqlite3', function() {
  describe('default stemmer', function(done) {
    it('should not index CJK character', function(done) {
      var db = mozporter(new sqlite3.Database(':memory:'));

      db.serialize(function() {
        db.run(`CREATE VIRTUAL TABLE documents USING fts4(id, title, content);`);
        db.run(`INSERT INTO documents VALUES(1, 'hello world', 'This message is a hello world message.');`);
        db.run(`INSERT INTO documents VALUES(2, 'urgent: serious', 'This mail is seen as a more serious mail');`);
        db.run(`INSERT INTO documents VALUES(3, '這是中文標題', '這是測試中文輸入');`);

        var sql = "SELECT id, rank(matchinfo(documents)) AS rank " +
          "FROM documents " +
          "WHERE documents MATCH '\"中文\"' " +
          "ORDER BY rank DESC  " +
          " LIMIT 10 OFFSET 0;"

        db.get(sql, function(err, result) {
          expect(result).to.not.exist;
          done();
        });
      });
      db.close();
    });
  });

  describe('mozporter', function() {
    it('should index english', function(done) {
      var db = mozporter(new sqlite3.Database(':memory:'));

      db.serialize(function() {
        db.run(`CREATE VIRTUAL TABLE documents USING fts4(id, title, content, tokenize=mozporter);`);
        db.run(`INSERT INTO documents VALUES(1, 'hello world', 'This message is a hello world message.');`);
        db.run(`INSERT INTO documents VALUES(2, 'urgent: serious', 'This mail is seen as a more serious mail');`);
        db.run(`INSERT INTO documents VALUES(3, '這是中文標題', '這是測試中文輸入');`);

        var sql = "SELECT id, rank(matchinfo(documents)) AS rank " +
          "FROM documents " +
          "WHERE documents MATCH '\"message\"' " +
          "ORDER BY rank DESC  " +
          " LIMIT 10 OFFSET 0;"

        db.get(sql, function(err, result) {
          expect(result).to.exist;
          expect(result.id).to.equal(1);
          done();
        });
      });
      db.close();
    });

    it('should index CJK', function(done) {
      var db = mozporter(new sqlite3.Database(':memory:'));

      db.serialize(function() {
        db.run(`CREATE VIRTUAL TABLE documents USING fts4(id, title, content, tokenize=mozporter);`);
        db.run(`INSERT INTO documents VALUES(1, 'hello world', 'This message is a hello world message.');`);
        db.run(`INSERT INTO documents VALUES(2, 'urgent: serious', 'This mail is seen as a more serious mail');`);
        db.run(`INSERT INTO documents VALUES(3, '這是中文標題', '這是測試中文輸入');`);

        var sql = "SELECT id, rank(matchinfo(documents)) AS rank " +
          "FROM documents " +
          "WHERE documents MATCH '\"中文\"' " +
          "ORDER BY rank DESC  " +
          " LIMIT 10 OFFSET 0;"

        db.get(sql, function(err, result) {
          expect(result).to.exist;
          expect(result.id).to.equal(3);
          done();
        });
      });
      db.close();
    });
  });
})
