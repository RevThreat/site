const fs = require('fs')
const path = require('path')

const TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <title>ThugCrowd Show Notes</title>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Thug Crowd Show Notes">
  <meta name="keywords" content="Podcast, Infosec, Hacking, CVE, News, Greyhat, Grayhat"
  <link rel="stylesheet" type="text/css" media="screen" href="../public/css/tc.css" />
  <style>
    body {
      background-color: black;
      font-family: monospace;
    }

    #banner {
      color: lightgray;
    }

    h3 {
      color: white
    }

    ul {
      list-style: none;
      margin-left: 0;
      padding-left: 0;
    }

    li {
      color: white;
      text-decoration: none;
      padding: 2px 0;
      font-family: monospace;
      white-space:pre;
    }

    li a { color: inherit }

    .host {
      -moz-user-select: none;
      -ms-user-select:none;
      -webkit-user-select: none;
      user-select:none;
      -o-user-select:none;
      color: #00cc00;
    }

    .l1 li {
      color: cyan;
    }

    .l1 li:before {
      content: "";
    }

    .l2 li {
      color: white;
    }

    .l2 li:before {
      content: "├── "
    }

    .l2 li:last-child:before {
      content: "└── "
    }

    .l3 li:before {
      content: "│   ├── "
    }
    .l3 li:last-child:before {
      content: "│   └── "
    }

    .path {
      -moz-user-select: none;
      -ms-user-select:none;
      -webkit-user-select: none;
      user-select:none;
      -o-user-select:none;
      color: #3366ff;
    }

    .command {
      -moz-user-select: none;
      -ms-user-select:none;
      -webkit-user-select: none;
      user-select:none;
      -o-user-select:none;
      color: white;
    }
  </style>
</head>
<body>
<pre id="banner">
_________                   _______  _______  _______  _______            ______  
\\__   __/|\\     /||\\     /|(  ____ \\(  ____ \\(  ____ )(  ___  )|\\     /| (  __  \\ 
   ) (   | )   ( || )   ( || (    \\/| (    \\/| (    )|| (   ) || )   ( | | (  \\  )
   | |   | (___) || |   | || |      | |      | (____)|| |   | || | _ | | | |   ) |
   | |   |  ___  || |   | || | ____ | |      |     __)| |   | || |( )| | | |   | |
   | |   | (   ) || |   | || | \\_  )| |      | (\\ (   | |   | || || || | | |   ) |
   | |   | )   ( || (___) || (___) || (____/\\| ) \\ \\__| (___) || () () | | (__/  )
   )_(   |/     \\|(_______)(_______)(_______/|/   \\__/(_______)(_______) (______/ 
                                                                        
 _______           _______          
(  ____ \\|\\     /|(  ___  )|\\     /|
| (    \\/| )   ( || (   ) || )   ( |
| (_____ | (___) || |   | || | _ | |
(_____  )|  ___  || |   | || |( )| |
      ) || (   ) || |   | || || || |
/\\____) || )   ( || (___) || () () |
\\_______)|/     \\|(_______)(_______)
                                               
 _        _______ _________ _______  _______ 
( (    /|(  ___  )\\__   __/(  ____ \\(  ____ \\
|  \\  ( || (   ) |   ) (   | (    \\/| (    \\/
|   \\ | || |   | |   | |   | (__    | (_____ 
| (\\ \\) || |   | |   | |   |  __)   (_____  )
| | \\   || |   | |   | |   | (            ) |
| )  \\  || (___) |   | |   | (____/\\/\\____) |
|/    )_)(_______)   )_(   (_______/\\_______)
</pre>
  <br>
  <br>
  <p><span class='host'>root@localhost</span>  <span class='path'>/home/root/tc/</span> <span class="command">$ tree</span></p>
{{list}}
</body>
</html>
`
const notesFilesData = fs.readdirSync(path.join(__dirname, '../notes'))
  .filter(x => x !== "index.html").map(filename => {
    const year = parseInt(filename.substring(0, 4))
    const month = parseInt(filename.substring(4, 6))
    const day = parseInt(filename.substring(6, 8))

    return {
      filename,
      year,
      month,
      day
    }
  })

const fileData = {}

notesFilesData.forEach(({day, month, year, filename}) => {
  if (!fileData[year]) fileData[year] = {}
  if (!fileData[year][month]) fileData[year][month] = []
  fileData[year][month].push({day, filename})
})

const notesList = Object.keys(fileData).map(year => {
  return `<ul class="l1">
    <li>${year}</li>
    ${Object.keys(fileData[year]).map(month => {
      return `<ul class="l2">
        <li>${month}</li>
        <ul class="l3">
          ${
            fileData[year][month]
              .map(({
                filename
              }) => `<li><a href="./${filename}">${filename}</a></li>`)
              .join('\n')
          }
        </ul>
      </ul>`
    }).join('\n')}
  </ul>`
}).join('\n')

fs.writeFileSync(path.join(__dirname, "../notes/index.html"), TEMPLATE.replace('{{list}}', notesList))
console.log('Notes list generation complete')