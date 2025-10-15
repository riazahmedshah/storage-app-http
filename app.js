import http from "node:http";
import { readdir, open, readFile } from "node:fs/promises";

const serveFiles = async (req, res) => {
  const [url, params] = req.url.split("?");
  // console.log("PATH",req.url,decodeURIComponent(url));
  const files = await readdir(`./storage${decodeURIComponent(url)}`);
  let dynamicHTML = ``;
  for (const file of files) {
    dynamicHTML += `${file} <a href="${req.url === "/" ? "" : req.url}/${file}?action=open">open</a> <a href="${req.url === "/" ? "" : req.url}/${file}?action=download">
        Download
      </a> </br>`;
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  const boilerPlateHTML = await readFile("boilerPlate.html", "utf-8");
  res.end(boilerPlateHTML.replace("${dynamicHTML}", dynamicHTML));
}


const server = http.createServer(async (req, res) => {
  if (req.url === "/favicon.ico") return res.end("No Favicon");
  if (req.url === "/") {
    serveFiles(req,res);
  } else {
    try {
      const [url, queryStrings] = req.url.split("?");
      
      const queryParams = {};
      queryStrings.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        queryParams[key] = value;
      })
      const fileHandle = await open(`./storage${decodeURIComponent(url)}`);
      const stat = await fileHandle.stat();
      if (stat.isDirectory()) {
        serveFiles(req,res);
      } else{
          res.setHeader('Content-Disposition', 'attachment')
          const readStream = fileHandle.createReadStream();
          if(queryParams.action === "open"){
            
          }
          readStream.pipe(res);
        
      }
    } catch (error) {
      console.log(error.message);
      res.end("Resource not found!")
    }
  }
});


server.listen(8000, () => {
  console.log("Server started");
})