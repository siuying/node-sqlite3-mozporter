{
  "targets": [
    {
      "target_name": "sqlite3-fts-cjk",
      "type": "shared_library",
      "dependencies": ["./node_modules/sqlite3/deps/sqlite3.gyp:sqlite3"],
      "sources": [
        "vendor/Normalize.c",
        "vendor/fts3_porter.c",
        "vendor/rank.m"
      ]
    }
  ]
}
