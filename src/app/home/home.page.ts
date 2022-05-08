import { Component,ChangeDetectorRef } from '@angular/core';
import { ZebraLib } from '@dolosplus/zebra-capacitor';
import { LoadingController,AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public classStatus = 'red';
  public matDoc  = '';
  countLoading = 0;

  constructor(private ref: ChangeDetectorRef, private loadingCtrl: LoadingController, private alertController: AlertController) {
    //this.testPrinter();
    ZebraLib.addListener('printerStatusChange', ({ isActive }) => {
      console.log('printerStatusChange state changed. Is active?', isActive);
      this.classStatus = (isActive)?'green':'red';
      this.ref.detectChanges();
    });

  }

  async errorMessage(subHeader='Server error', message='Please try again later') {
    const alert = await this.alertController.create({
      subHeader,
      message: message,
      cssClass: 'error-alert',
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log('closing the error alert');
        }
      }]
    });

    await alert.present();
  }

  async presentLoading(message: string = 'Loading...'): Promise<void> {
    this.countLoading += 1;
    if (this.countLoading === 1) {
      const loading = await this.loadingCtrl.create({
        message,
      });
      return await loading.present();
    }
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async dismissLoading(ms=1000) {
    console.log(`dismissLoading(${ms})`)
    await this.timeout(ms);

    this.countLoading -= 1;
    if (this.countLoading > 0) {
      return;
    }
    this.loadingCtrl.getTop().then(async loader => {
      this.countLoading = 0;
      if (!loader) {
        return;
      }
      await this.loadingCtrl.dismiss();
    });
  }



  async connectPrinter(){
    // const results = (await ZebraLib.connectPrinter({config: 'my filter'}));
    // console.log('connectPrinter() ZebraLib results:',results);
    this.presentLoading();
    try{
      const results = await ZebraLib.connectPrinter({config: '2x4'});
      console.log('connectPrinter() ZebraLib results:',results);
      this.classStatus = (results.result)?'green':'red';
      this.dismissLoading();
    }catch(e){
      console.error('connectPrinter() Printer error:',e);
      this.dismissLoading(100);
      await this.errorMessage("Failed to connect");

    }
  }

  async printText(){
    try{
      const results = (await ZebraLib.printText({text: 'THIS IS MY TEXT'}));
      console.log('printText() ZebraLib results:',results);
    }catch(e){
      console.error('ERROR: printText()',e);
    }
  }

  async printPDF(){
 

    // eslint-disable-next-line max-len
    const base64PDFData = 'JVBERi0xLjYNCiXi48/TDQoyIDAgb2JqCjw8L0xlbmd0aCAzNjUzL1N1YnR5cGUvWE1ML1R5cGUvTWV0YWRhdGE+PnN0cmVhbQ0KPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMwMTUgODEuMTYxNTgwLCAyMDE5LzA1LzE1LTAyOjQwOjAwICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnBkZj0iaHR0cDovL25zLmFkb2JlLmNvbS9wZGYvMS4zLyIKICAgICAgICAgICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6ZGVzYz0iaHR0cDovL25zLmFkb2JlLmNvbS94ZmEvcHJvbW90ZWQtZGVzYy8iPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDIxLTA2LTIxVDE4OjU4OjExLTA0OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkFkb2JlIExpdmVDeWNsZSBEZXNpZ25lciAxMS4wPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDIxLTA2LTIxVDE4OjU4OjExLTA0OjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMjEtMDYtMjFUMTg6NTg6MTEtMDQ6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8cGRmOlByb2R1Y2VyPkFkb2JlIFhNTCBGb3JtIE1vZHVsZSBMaWJyYXJ5PC9wZGY6UHJvZHVjZXI+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnV1aWQ6OTBkY2U0NWUtYjM2MC00NGQzLTg0ODAtMzkyMzcwZjA5YWY4PC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD51dWlkOjIzMTAxZWYwLTFkZDItMTFiMi0wYTAwLTAwMDAwMDAwMjdkMzwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPGRjOmZvcm1hdD5hcHBsaWNhdGlvbi9wZGY8L2RjOmZvcm1hdD4KICAgICAgICAgPGRlc2M6dmVyc2lvbiByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgIDxyZGY6dmFsdWU+OC4yLjMuNDE5NS4xLjU3MjM5Ny41NDE5OTc8L3JkZjp2YWx1ZT4KICAgICAgICAgICAgPGRlc2M6cmVmPi90ZW1wbGF0ZS9zdWJmb3JtWzFdPC9kZXNjOnJlZj4KICAgICAgICAgPC9kZXNjOnZlcnNpb24+CiAgICAgICAgIDxkZXNjOlNjaGVtYV9Bbm5vdGF0aW9uIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgPHJkZjp2YWx1ZT5Hcm9zcyBXZWlnaHQ8L3JkZjp2YWx1ZT4KICAgICAgICAgICAgPGRlc2M6cmVmPi90ZW1wbGF0ZS9zdWJmb3JtWzFdL3N1YmZvcm1bMV0vZmllbGRbMV08L2Rlc2M6cmVmPgogICAgICAgICA8L2Rlc2M6U2NoZW1hX0Fubm90YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAg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';
    // const results = (await ZebraLib.printPDF({base64: pdfPage}));
    // console.log('printPDF() ZebraLib results:',results);
    try{
      this.presentLoading();
      const status = (await ZebraLib.printPDF({base64: base64PDFData}));
      console.log('printPDF() ZebraLib results:',status);
      this.dismissLoading();
      return status.result;

    }catch(e){
      console.error('ERROR: printPDF()',e);
      this.dismissLoading(100);
      await this.errorMessage("Failed to connect");
  
    }
  }



}
