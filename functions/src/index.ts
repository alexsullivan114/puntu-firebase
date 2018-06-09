import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DataSnapshot } from 'firebase-functions/lib/providers/database';

admin.initializeApp();

export const addMessage = functions.https.onRequest((request, response) => {
  const original = request.query.text;
  return admin.database().ref('/test-messages').push({original: original}).then((snapshot) => {
    response.redirect(303, snapshot.ref.toString())
  })
});

export const sendMessageNotification = functions.database.ref('/messages/{messageUuid}')
  .onWrite((change, context) => {

    const message = change.after.val().text
    const sender = change.after.val().user

    const target = sender == 1 ? 0 : 1
    console.log("Target: " + target)

    const path = "/tokens/" + target
    return admin.database().ref(path).once('value')
      .then(result => {
        const token = result.val()
        const payload = {
          notification: {
            title: "Message from a punt!",
            body: message,
          }
        }

        return admin.messaging().sendToDevice(token, payload)
      })
  })
