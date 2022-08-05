import { Component,ChangeDetectorRef } from '@angular/core';
import { ZebraLib } from '@dolosplus/zebra-capacitor';
import { LoadingController,AlertController } from '@ionic/angular';
import * as _ from 'lodash';

const META_PDF = 'data:application/pdf;base64,';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public classStatus = 'red';
  public matDoc  = '';
  countLoading = 0;
  imageError: string;
  isImageSaved: boolean;
  cardImageBase64: string;

  constructor(private ref: ChangeDetectorRef, private loadingCtrl: LoadingController, private alertController: AlertController) {
    //this.testPrinter();
    ZebraLib.addListener('printerStatusChange', ({ isActive }) => {
      console.log('printerStatusChange state changed. Is active?', isActive);
      this.classStatus = (isActive)?'green':'red';
      this.ref.detectChanges();
    });

  }

  removeImage() {
    this.cardImageBase64 = null;
    this.isImageSaved = false;
  }

  fileChangeEvent(fileInput: any) {
    this.imageError = null;
    if (fileInput.target.files && fileInput.target.files[0]) {
        // Size Filter Bytes
        const max_size = 20971520;
        const allowed_types = ['application/pdf','image/png', 'image/jpeg'];
        const max_height = 15200;
        const max_width = 25600;

        if (fileInput.target.files[0].size > max_size) {
            this.imageError =
                'Maximum size allowed is ' + max_size / 1000 + 'Mb';

            return false;
        }

        if (!_.includes(allowed_types, fileInput.target.files[0].type)) {
            this.imageError = 'Only Images are allowed ( JPG | PNG )';
            return false;
        }
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const imgBase64Path = e.target.result;
          this.cardImageBase64 = imgBase64Path;
          this.isImageSaved = true;

            //const image = new Image();
            //image.src = e.target.result;
            // image.onload = rs => {
            //     const img_height = rs.currentTarget['height'];
            //     const img_width = rs.currentTarget['width'];

            //     console.log(img_height, img_width);


            //     if (img_height > max_height && img_width > max_width) {
            //         this.imageError =
            //             'Maximum dimentions allowed ' +
            //             max_height +
            //             '*' +
            //             max_width +
            //             'px';
            //         return false;
            //     } else {
            //         const imgBase64Path = e.target.result;
            //         this.cardImageBase64 = imgBase64Path;
            //         this.isImageSaved = true;
            //         // this.previewImagePath = imgBase64Path;
            //     }
            // };
        };

        reader.readAsDataURL(fileInput.target.files[0]);
    }
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

  async printPDF13(){
    try{
      const base64PDFData = this.cardImageBase64.replace(META_PDF,'');
      this.presentLoading();
      const margin = 26;
      const LABEL_3BY1 =  {x:0,y:0,width: 624-margin, height: 208-margin};

      const status = (await ZebraLib.printPDF({base64: base64PDFData, size: LABEL_3BY1}));
      console.log('printPDF() ZebraLib results:',status);
      this.dismissLoading();
      return status.result;

    }catch(e){
      console.error('ERROR: printPDF()',e);
      this.dismissLoading(100);
      await this.errorMessage('Failed to connect');
  
    }
  }

  async printPDF(){
 
    // const results = (await ZebraLib.printPDF({base64: pdfPage}));
    // console.log('printPDF() ZebraLib results:',results);
    try{
      this.presentLoading();
      const base64PDFData = this.cardImageBase64.replace(META_PDF,'');
      //const LABEL4by3: PaperSize =  {x:0,y:0,width: 832, height: 624};
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
