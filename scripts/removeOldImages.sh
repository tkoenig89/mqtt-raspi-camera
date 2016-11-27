#deletes images older than 4000 minutes ~ 3 days
find $1/* -type d -mmin +$2 -exec rm -rf {} \;