const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Firestore and Realtime Database references
const firestore = admin.firestore();
const realtimeDB = admin.database();

// Function to trigger when a new place is added to Firestore
exports.addPlaceToRealtimeDB = functions.firestore
    .document('places/{placeId}')
    .onCreate((snapshot, context) => {
        // Get the newly added place data
        const newData = snapshot.data();
        const placeId = context.params.placeId;

        // Create a corresponding entry in the Realtime Database
        return realtimeDB.ref(`places/${placeId}`).set(newData);
    });

// Function to trigger when a new room is added or its status is updated in Firestore
exports.updateRoomStatusInRealtimeDB = functions.firestore
    .document('places/{placeId}/rooms/{roomId}')
    .onWrite((change, context) => {
        // Get the updated room data
        const newData = change.after.data();
        const placeId = context.params.placeId;
        const roomId = context.params.roomId;

        // If the room is deleted, remove it from the Realtime Database
        if (!change.after.exists) {
            return realtimeDB.ref(`places/${placeId}/rooms/${roomId}`).remove();
        }

        // Otherwise, update the status in Realtime Database
        const status = newData.status;
        return realtimeDB.ref(`places/${placeId}/rooms/${roomId}`).update({ status });
    });
