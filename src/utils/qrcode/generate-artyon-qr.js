import QRCode from 'qrcode';

const urls = [
  'https://www.mirrorfuturediamond.com/arTryOn?model=p1',
  'https://www.mirrorfuturediamond.com/arTryOn?model=p2',
  'https://www.mirrorfuturediamond.com/arTryOn?model=p3',
  'https://www.mirrorfuturediamond.com/arTryOn?model=p4',
  'https://www.mirrorfuturediamond.com/arTryOn?model=p5',
  'https://www.mirrorfuturediamond.com/arTryOn?model=p6',
  'https://www.mirrorfuturediamond.com/arTryOn?model=p7',
  'https://www.mirrorfuturediamond.com/arTryOn?model=p8',
];

async function generateQRCodes() {
  for (let i = 0; i < urls.length; i++) {
    const model = `p${i + 1}`;
    const fileName = `qr-arTryOn-${model}.png`;

    await QRCode.toFile(fileName, urls[i], {
      type: 'png',
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log(`✓ Generated ${fileName}`);
    console.log(`  URL: ${urls[i]}\n`);
  }

  console.log('Done! All 8 QR codes generated.');
}

generateQRCodes().catch(console.error);
