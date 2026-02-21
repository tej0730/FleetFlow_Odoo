#!/bin/sh
git filter-branch --env-filter '
    export GIT_AUTHOR_NAME="tej0730"
    export GIT_AUTHOR_EMAIL="tejdoshi55@gmail.com"
    export GIT_COMMITTER_NAME="tej0730"
    export GIT_COMMITTER_EMAIL="tejdoshi55@gmail.com"
' --force -- --all
