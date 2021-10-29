import Head from 'next/head'
import styles from '../styles/Home.module.css'

import JSZip from 'jszip';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FolderOpenTwoToneIcon from '@mui/icons-material/FolderOpenTwoTone';

export default function Home() {

  const [sourcefile,setSourceFile] = React.useState(null)
  const [title,setTitle] = React.useState('AI2.js - The Ultimate Converter')
  const [description,setDescription] = React.useState('A project that convert MIT App Inventor 2 Project (.aia) into Web Apps.')
  const [favicon,setFavIcon] = React.useState('/favicon.ico')

  const readFile = (files) => {
   try {
    console.log(files[0].name)
    const zip = new JSZip()
    for (var i = 0; i < files.length; i++) {
     zip.loadAsync(files[i])                               
     .then(function(zip) {
        zip.forEach(function (relativePath, zipEntry) {
            console.log(zipEntry.name)
            if (zipEntry.name.includes('.scm')) {
            zip.file(zipEntry.name).async("string").then(function (data) {
              data = data.replace('#|','')
              data = data.replace('$JSON','')
              data = data.replace('|#','')
              setSourceFile(JSON.stringify(JSON.parse(data), null, 4))
              setTitle(JSON.parse(data).Properties.AppName)
              setDescription(JSON.parse(data).Properties.AboutScreen)
            });
          } else if (zipEntry.name.includes('.png')){
            zip.file(zipEntry.name).async("base64").then(function (data) {
              setFavIcon('data:image/jpeg;base64,'+data)
            });
          } else if (zipEntry.name.includes('/external_comps')){
            console.log('Warning : Extensions are not supported, all related items will generally be ignored.')
          }
        });
      });
    }
   } catch (error) {
     console.log(error)
   }
  }

  return (
    <React.Fragment>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar className={styles.appBar} position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" style={{color: '#4cad50',fontWeight: '600',marginRight: '10px'}}>
            AI2.js
          </Typography>
        <label htmlFor="contained-button-file">
        <IconButton className={styles.menuButton} component="span">
          <FolderOpenTwoToneIcon />
        </IconButton>
        </label>
        </Toolbar>
      </AppBar>
    </Box>

    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href={favicon} />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://github.com/kwankiu/ai2-js">AI2.js!</a>
        </h1>

        <p className={styles.description}>
          A project that convert MIT App Inventor 2 Project (.aia) into Web Apps.
        </p>

        <label htmlFor="contained-button-file">
        <input style={{display:'none'}} id="contained-button-file" multiple type="file" onChange={(e) => readFile(e.target.files)} />
        <Button variant="outlined" color="success" component="span" style={{textTransform:'none'}}>Upload File (.aia) ...</Button>
        </label>

        <br />

        <pre className={styles.code}>{sourcefile}</pre>

      </main>
    </div>
    </React.Fragment>
  )
}
