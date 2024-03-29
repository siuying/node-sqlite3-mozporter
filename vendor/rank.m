#import "rank.h"
#import "fts3_tokenizer.h"

SQLITE_EXTENSION_INIT1

/*
 ** SQLite user defined function to use with matchinfo() to calculate the
 ** relevancy of an FTS match. The value returned is the relevancy score
 ** (a real value greater than or equal to zero). A larger value indicates
 ** a more relevant document.
 **
 ** The overall relevancy returned is the sum of the relevancies of each
 ** column value in the FTS table. The relevancy of a column value is the
 ** sum of the following for each reportable phrase in the FTS query:
 **
 ** (<hit count> / <global hit count>) * <column weight>
 **
 ** where <hit count> is the number of instances of the phrase in the
 ** column value of the current row and <global hit count> is the number
 ** of instances of the phrase in the same column of all rows in the FTS
 ** table. The <column weight> is a weighting factor assigned to each
 ** column by the caller (see below).
 **
 ** The first argument to this function must be the return value of the FTS
 ** matchinfo() function. Following this must be one argument for each column
 ** of the FTS table containing a numeric weight factor for the corresponding
 ** column. Example:
 **
 ** CREATE VIRTUAL TABLE documents USING fts3(title, content)
 **
 ** The following query returns the docids of documents that match the full-text
 ** query <query> sorted from most to least relevant. When calculating
 ** relevance, query term instances in the 'title' column are given twice the
 ** weighting of those in the 'content' column.
 **
 ** SELECT docid FROM documents
 ** WHERE documents MATCH <query>
 ** ORDER BY rank(matchinfo(documents), 1.0, 0.5) DESC
 */
static void rankfunc(sqlite3_context *pCtx, int nVal, sqlite3_value **apVal){
    unsigned int *aMatchinfo; /* Return value of matchinfo() */
    int nCol; /* Number of columns in the table */
    int nPhrase; /* Number of phrases in the query */
    int iPhrase; /* Current phrase */
    double score = 0.0; /* Value to return */
    double defaultWeight = 1.0;

    assert( sizeof(int)==4 );

    /* Check that the number of arguments passed to this function is correct.
     ** If not, jump to wrong_number_args. Set aMatchinfo to point to the array
     ** of unsigned integer values returned by FTS function matchinfo. Set
     ** nPhrase to contain the number of reportable phrases in the users full-text
     ** query, and nCol to the number of columns in the table.
     */
    aMatchinfo = (unsigned int *)sqlite3_value_blob(apVal[0]);
    nPhrase = aMatchinfo[0];
    nCol = aMatchinfo[1];
    if ( (nVal - 1) > nCol ) goto wrong_number_args;


    /* Iterate through each phrase in the users query. */
    for(iPhrase=0; iPhrase<nPhrase; iPhrase++){
        int iCol; /* Current column */

        /* Now iterate through each column in the users query. For each column,
         ** increment the relevancy score by:
         **
         ** (<hit count> / <global hit count>) * <column weight>
         **
         ** aPhraseinfo[] points to the start of the data for phrase iPhrase. So
         ** the hit count and global hit counts for each column are found in
         ** aPhraseinfo[iCol*3] and aPhraseinfo[iCol*3+1], respectively.
         */
        unsigned int *aPhraseinfo = &aMatchinfo[2 + iPhrase*nCol*3];
        for(iCol=0; iCol<nCol; iCol++){
            int nHitCount = aPhraseinfo[3*iCol];
            int nGlobalHitCount = aPhraseinfo[3*iCol+1];
            double weight = defaultWeight;
            if ( (1 + iCol) < nVal ) weight = sqlite3_value_double(apVal[1 + iCol]);
            if( nHitCount>0 ){
                score += ((double)nHitCount / (double)nGlobalHitCount) * weight;
            }
        }
    }

    sqlite3_result_double(pCtx, score);
    return;

    /* Jump here if the wrong number of arguments are passed to this function */
wrong_number_args:
    sqlite3_result_error(pCtx, "wrong number of arguments to function rank()", -1);
}

static void mozporterfunc(sqlite3_context *pCtx, int nVal, sqlite3_value **apVal){
    const static sqlite3_tokenizer_module* module;
    sqlite3Fts3PorterTokenizerModule(&module);
    sqlite3_result_blob(pCtx, &module, sizeof(module), 0);
    return;
}

/* SQLite invokes this routine once when it loads the extension.
 ** Create new functions, collating sequences, and virtual table
 ** modules here. This is usually the only exported symbol in
 ** the shared library.
 */
int sqlite3_extension_init(sqlite3 *db, char **pzErrMsg, const sqlite3_api_routines *pApi) {
    SQLITE_EXTENSION_INIT2(pApi)
    sqlite3_create_function(db, "rank", -1, SQLITE_ANY, 0, rankfunc, 0, 0);
    sqlite3_create_function(db, "mozporter", -1, SQLITE_ANY, 0, mozporterfunc, 0, 0);
    return 0;
}