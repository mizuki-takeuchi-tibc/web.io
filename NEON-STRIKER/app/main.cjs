const {app,BrowserWindow,Menu}=require('electron');
const path=require('node:path');
app.whenReady().then(()=>{
 Menu.setApplicationMenu(null);
 const win=new BrowserWindow({width:1200,height:880,minWidth:700,minHeight:650,title:'NEON STRIKER',backgroundColor:'#050814',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',e=>e.preventDefault());
 win.loadFile(path.join(__dirname,'index.html'));
});
app.on('window-all-closed',()=>app.quit());
