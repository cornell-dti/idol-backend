import { bucket } from './firebase';

// bucket.upload(
//   './firebase-storage-test/penguin.jpg',
//   (err, file, apiResponse) => {
//     console.log(err);
//   }
// );

// bucket.getFiles((err, files) => {
//   if (err) {
//     console.log(err);
//   } else if (files !== undefined) {
//     files.forEach((file) => {
//       file.download(
//         // destination has to be based on name
//         { destination: './firebase-storage-test/images/penguin.jpg' },
//         (err) => console.log(err)
//       );
//     });
//   }
// });

bucket.getFiles((err, files) => {
  if (err) {
    console.log(err);
  } else if (files !== undefined) {
    files.forEach((file) => {
      console.log(file.metadata.name);
    });
  }
});
