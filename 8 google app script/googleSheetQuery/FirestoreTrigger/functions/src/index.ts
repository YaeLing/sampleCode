import * as functions from 'firebase-functions';
import { sheet } from './service/googleSheet';
import { Student } from './model/student';
import { Row } from './model/data';

const sheets = new sheet();

export const firestoreTriggerV3= functions.firestore
    .document('student/{studentId}')
    .onCreate((snap, context) => {
        const student = snap.data() as Student;
        sheets.query(student).then((back) => {
            const row = back as Row;
            if (row.row == 0)
                sheets.create(student);
            else
                sheets.update(row.row, student);
        })

        return 0;
        // perform desired operations ...
    });
