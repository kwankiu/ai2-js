/* AI2.js - A project that convert MIT App Inventor 2 Project (.aia) into Web Apps
Author: Samuel (kwankiu), Hei (Hei-dev)
All rights reserved.
*/

import * as React from 'react';
import Head from 'next/head'
import styles from '../styles/Home.module.css'

//For Zip
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

//Material-UI
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FolderOpenTwoToneIcon from '@mui/icons-material/FolderOpenTwoTone';

export default function Home() {
  
  //Declare regular variables
  const [sourcefile,setSourceFile] = React.useState()

  //create a zip component
  const zip = new JSZip()

  //html head infomation
  const [title,setTitle] = React.useState('AI2.js - The Ultimate Converter')
  const [description,setDescription] = React.useState('A project that convert MIT App Inventor 2 Project (.aia) into Web Apps.')
  const [favicon,setFavIcon] = React.useState('/favicon.ico')

  //variables to store imported data
  var properties; // store properties from project.properties
  var screen = []; // array to store all data from .scm file
  // var blocks = []; // declared for future implementation

  const readFile = (files) => {
   try {
    let filecontent; // to combine scm files content
    let scmi = 1; //count number of scm 
    console.log(files[0].name) // show the uploaded file name
    for (var i = 0; i < files.length; i++) {
     zip.loadAsync(files[i])                               
     .then(function(zip) {
        zip.forEach(function (relativePath, zipEntry) {
            console.log(zipEntry.name) // List all file from uploaded zip
            if (zipEntry.name == 'youngandroidproject/project.properties'){
              zip.file(zipEntry.name).async("string").then(function (data) {
                //convert project.properties into JSON
                data = data.replace(/^.*#.*$/mg,'') //remove # comment
                data = data.replaceAll(new RegExp("[\r\n]", "gm"), '","')
                data = '{"' + data + '}'
                data = data.replaceAll('=','":"')
                data = data.replace(',"}','}') 
                data = data.replaceAll('"",','') //remove empty string from comment
                //save generated json to properties
                properties = JSON.parse(data)
                console.log(properties)
                setSourceFile(JSON.stringify(properties, null, 4))
              });
            } else if  (zipEntry.name.includes('.scm')) {
              zip.file(zipEntry.name).async("string").then(function (data) {
              //convert .scm file into JSON
              data = data.replace('#|','')
              data = data.replace('$JSON','')
              data = data.replace('|#','')
              screen[scmi] = JSON.stringify(JSON.parse(data), null, 4);
              console.log(scmi)
              scmi = scmi + 1;
              if (filecontent) {
              filecontent = filecontent + screen[scmi];
              } else {
              filecontent = screen[scmi];
              }
              setTitle(JSON.parse(data).Properties.AppName) //set html title
              setDescription(JSON.parse(data).Properties.AboutScreen) //set html descriptions
              console.log(JSON.parse(data).Properties) //show json list of properties of each screen
              });
            } else if (zipEntry.name.includes('assets/')){
             if (zipEntry.name.includes('.png')){
              zip.file(zipEntry.name).async("base64").then(function (data) {
              //TODO : save all image into an array as base64
              console.log('data:image/png;base64,'+data)
              });
             } else if (zipEntry.name.includes('.jpg') || zipEntry.name.includes('.jpeg')){
              zip.file(zipEntry.name).async("base64").then(function (data) {
              //TODO : save all image into an array as base64
              console.log('data:image/jpeg;base64,'+data)
              });             
             } else if (zipEntry.name.includes('external_comps/')){
              //Detect and warn users when Extensions are used in the AIA
              //Since we are unable to port Extensions (Java Bytecode) to Web Technologies
              console.log('Warning : Extensions are not supported, all related items will generally be ignored.')
             } else {
              //TODO : all non base64 or string assets should be loaded as binary
             }
            } 
        });
      });
    }
   } catch (error) {
     console.log(error)
   } finally {
     //Since properties are defined at the last (due to a-z order), for actions that depends on data from properties, it has to be done after the for loop
     //TODO
   }
  }

  const exportFile = () => {

    // not added, this will generate an empty zip file as no files are put inside
    // usage
    // zip.file(filename,content)
    // zip.folder(foldername)
    // zip.remove(filename/foldername)
    let appname = "project"
    let file_extension = ".zip"
    let zipname = appname + file_extension

    zip.generateAsync({type:"blob"})
    .then(function (blob) {
    saveAs(blob, zipname);
    });
  }
  
  // Main Content
  return (
    <React.Fragment> 
    <Box sx={{ flexGrow: 1 }}>
      <AppBar className={styles.appBar} position="fixed">
        <Toolbar>
          <img src="/logo.svg" alt="AI2.js" style={{height: '32px',marginRight: '10px'}} />
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
        <br />
        <Button onClick={exportFile} variant="outlined" color="success" component="span" style={{textTransform:'none', display:'none'}}>Download File (.zip)</Button>

      </main>
    </div>
    </React.Fragment>
  )
}
