var sqlite3 = require('sqlite3')
var db = new sqlite3.Database(':memory:')
require('./')(db, function(e) {
  if (e) {
    console.log("error", e)
  }
});

db.serialize(function() {
  db.run(`CREATE VIRTUAL TABLE documents USING fts4(title, content, tokenize=mozporter);`);

  db.run(`INSERT INTO documents VALUES('hello world', 'This message is a hello world message.');`);
  db.run(`INSERT INTO documents VALUES('urgent: serious', 'This mail is seen as a more serious mail');`);
  db.run(`INSERT INTO documents VALUES('這是中文標題', '這是測試中文輸入');`);

  // Do stuff with the new rank UDF!
  var sql = "SELECT docid, rank(matchinfo(documents)) AS rank " +
    "FROM documents " +
    "WHERE documents MATCH '\"message\"' " +
    "ORDER BY rank DESC  " +
    " LIMIT 10 OFFSET 0;"

  db.each(sql, function(err, row) {
    if (err) {
      console.log("error", err);
      return
    }

    console.log("message:", row);
  });

  sql = "SELECT docid, rank(matchinfo(documents)) AS rank " +
    "FROM documents " +
    "WHERE documents MATCH '\"標題\"' " +
    "ORDER BY rank DESC  " +
    " LIMIT 10 OFFSET 0;"

  db.each(sql, function(err, row) {
    if (err) {
      console.log("error", err);
      return
    }

    console.log("標題:", row);
  });
});


db.close();
