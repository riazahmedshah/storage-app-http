import http from "node:http";
import { readdir, open, readFile } from "node:fs/promises";

const serveFiles = async (req, res) => {
  const files = await readdir(`./storage${decodeURIComponent(req.url)}`);
  let dynamicHTML = ``;
  for (const file of files) {
    dynamicHTML += `<li><a target="_blank" href="${req.url === "/" ? "" : req.url}/${file}">
      ${file}
    </a></li>`;
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
      const fileHandle = await open(`./storage${decodeURIComponent(req.url)}`);
      const stat = await fileHandle.stat();
      if (stat.isDirectory()) {
        serveFiles(req,res);
      } else{
        const readStream = fileHandle.createReadStream();
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