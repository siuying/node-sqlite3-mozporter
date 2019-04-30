# node-sqlite3-mozporter

Use Mozilla Porter stemmer for sqlite3, for CKJ FTS using FTS3 module in sqlite3.

## Installation

Since sqlite 3.12.0, fts3 tokenizer requires `SQLITE_ENABLE_FTS3_TOKENIZER` compiler flag.
Include this flag when you install sqlite:

``
export CFLAGS="-DSQLITE_ENABLE_FTS3_TOKENIZER"
npm install sqlite3 --build-from-source
``

## LICENSE

node-sqlite3-mozporter is MIT licensed.
