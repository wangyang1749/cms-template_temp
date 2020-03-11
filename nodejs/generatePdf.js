const puppeteer = require('puppeteer');
var arguments = process.argv.splice(2);


if(arguments.length<2){
    console.log('参数必须大于两个')
    return;
}
// http://127.0.0.1:5500/html/article/cc3d2502-dd9e-4c4d-b3f9-17dc50962c5b.html
(async () => {
    const browser = await puppeteer.launch();
    try{
        console.log("准备生成文件"+arguments[1])
        const page = await browser.newPage();
        await page.goto(arguments[0], {waitUntil: 'networkidle2'});
        await page.pdf({margin:{top:'60px'},displayHeaderFooter:false,printBackground:false,path: arguments[1], format: 'A4'});
        await browser.close();
        console.log("生成成功!!")
    }catch(err){
        console.log('发生错误'+err);
        await browser.close();
    }
  
})();