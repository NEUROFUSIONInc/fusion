import fs from 'fs'
import path from 'path'

export default function handler(req:any, res:any) {
  const {
    query: { file, id },
  } = req


   const idRootMap:any = {"1":"src/components/lab/jspsych/psychometrics"}
   
   if(!(id in idRootMap)) res.status(404).json({ message: `invalid experiment ${id}` })


  const filePath = path.resolve(idRootMap[id],file.trim())
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: `${filePath} Doesnt Exist` })
    return
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  res.status(200).end(fileContent)
}