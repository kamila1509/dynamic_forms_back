const admin = require('firebase-admin'); // Agregado: importar firebase-admin
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const serviceAccount = require("../firebase-adminsdk-key.json"); // Agregado: importar archivo de configuración de Firebase
const { initializeApp }  = require('firebase/app');
const { child,
    get,
    getDatabase,
    push,
    remove,
    ref,
    set,
    update } = require('firebase/database')
const { v4: uuidv4 } = require('uuid');
const { filterUndefined, convertObjtoArray, formatResponses } = require('../utils/global')
// Agregado: inicializar la aplicación de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://viu-tfm-dashboard-default-rtdb.firebaseio.com",
});

initializeApp({
    apiKey: 'AIzaSyCZeDDcgVUQFeu74ru7gcgLQvtzKWksJwc',
    projectId: 'viu-tfm-dashboard'
});

const db = admin.database();

// Función para manejar errores
function handleError(res, err) {
    return res.status(500).send({ message: `${err.code} - ${err.message}` });
}

async function getToken(req, res) {
    try {
        const auth = getAuth();
        const credentials = await signInWithEmailAndPassword(auth, "root@gmail.com", 'password');
        return res.status(200).send(credentials.user.stsTokenManager.accessToken);
    } catch (err) {
        return handleError(res, err);
    }
}

async function create(req, res) {
    try {
        const { displayName, password, email, role } = req.body;

        if (!displayName || !password || !email || !role) {
            return res.status(400).send({ message: 'Missing fields' });
        }

        const { uid } = await admin.auth().createUser({
            displayName,
            password,
            email
        });
        await admin.auth().setCustomUserClaims(uid, { role: 'manager' });

        return res.status(201).send({ uid });
    } catch (err) {
        return handleError(res, err);
    }
}

async function all(req, res) {
    try {
        const listUsers = await admin.auth().listUsers();
        const users = listUsers.users.map(mapUser)
        return res.status(200).send(users);
    } catch (err) {
        return handleError(res, err);
    }
}

function mapUser(user) {
    const customClaims = (user.customClaims || { role: '' });
    const role = customClaims.role ? customClaims.role : '';
    return {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role,
        lastSignInTime: user.metadata.lastSignInTime,
        creationTime: user.metadata.creationTime
    };
}

async function getUser(req, res) {
    try {
        const { id } = req.params;
        const user = await admin.auth().getUser(id);
        return res.status(200).send(mapUser(user));
    } catch (err) {
        return handleError(res, err);
    }
}

async function patch(req, res) {
    try {
        const { id } = req.params;
        const { displayName, password, email, role } = req.body;

        if (!id || !displayName || !email || !role) {
            return res.status(400).send({ message: 'Missing fields' });
        }

        await admin.auth().updateUser(id, { displayName, email });
        await admin.auth().setCustomUserClaims(id, { role });
        const user = await admin.auth().getUser(id);

        return res.status(204).send({ user: mapUser(user) });
    } catch (err) {
        return handleError(res, err);
    }
}

async function removeUser(req, res) {
    try {
        const { id } = req.params;
        await admin.auth().deleteUser(id);
        return res.status(204).send({});
    } catch (err) {
        return handleError(res, err);
    }
}

async function saveUserData(req, res) {
    try {
        const { id } = req.params;
        const { email } = req.body
        const userRef = ref(db, `users/${id}`);
       await update(userRef, { email: email });
      } catch (err) {
        console.error("El usuario no se actualizo:", err);
        return handleError(res, err);
      }

};

async function getForms(req, res) {
    try {
        const { id } = req.params;
        const userRef = ref(db, `users/${id}/forms`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          // Obtener todos los formularios del usuario
          const forms = snapshot.val();
          return res.status(200).send(forms);
        } else {
          console.log("El usuario no tiene formularios.");
          return res.status(200).send({forms});
        }
      } catch (err) {
        console.error("Error al obtener los formularios:", err);
        return handleError(res, err);
      }

};

async function getFormsById(req, res) {
    try {
        const { id, formId } = req.params;
        const userRef = ref(db, `users/${id}/forms/${formId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          // Obtener todos los formularios del usuario
          const forms = snapshot.val();
          delete forms.responses
          return res.status(200).send(forms);
        } else {
          console.log("El usuario no tiene formularios.");
          return res.status(200).send({forms});
        }
      } catch (err) {
        console.error("Error al obtener los formularios:", err);
        return handleError(res, err);
      }
};

async function saveForm(req , res) {
    try {
        const { id } = req.params;
        const { form, name } = req.body;
        const formStructureId = uuidv4().substring(0, 8);
        // Crea una referencia a la ubicación en la base de datos específica para ese usuario
        const formStructuresRef = ref(
          db,
          `users/${id}/forms/${formStructureId}`
        );
        set(formStructuresRef, {
            name,
            id: formStructureId,
            form: filterUndefined(form),
        }).then((response) => {
            console.log(
              "Datos de formStructures guardados con éxito con tu propio ID único"
            );
            return res.status(201).send({ response })
        })
        .catch((err) => {
            console.error("Error al guardar datos de formStructures:", err);
            return handleError(res, err)
        });

    } catch (err) {
        return handleError(res, err);
    }
}

async function updateForm(req , res) {
    try {
        const { id, formId } = req.params;
        const { form, name } = req.body;
        console.log(req.params)
        console.log(req.body)
        // Crea una referencia a la ubicación en la base de datos específica para ese usuario
        const formStructuresRef = ref(
          db,
          `users/${id}/forms/${formId}`
        );
        set(formStructuresRef, {
            name,
            id: formId,
            form: filterUndefined(form),
        }).then((response) => {
            console.log(
              "Datos de formStructures guardados con éxito con tu propio ID único"
            );
            return res.status(201).send({ response })
        })
        .catch((err) => {
            console.error("Error al guardar datos de formStructures:", err);
            return handleError(res, err)
        });

    } catch (err) {
        return handleError(res, err);
    }
}

async function removeForm(req , res) {
    try {
        const { id, formId } = req.params;
        
        // Crea una referencia a la ubicación en la base de datos específica para ese usuario
        const formStructuresRef = ref(
          db,
          `users/${id}/forms/${formId}`
        );

        // Elimina la referencia de la base de datos
        remove(formStructuresRef)
            .then(() => {
                console.log("Referencia de formStructures eliminada con éxito");
                return res.status(204).send();
            })
            .catch((err) => {
                console.error("Error al eliminar referencia de formStructures:", err);
                return handleError(res, err);
            });
    } catch (err) {
        return handleError(res, err);
    }
}



async function saveResponseForm(req , res) {
    try {
        const { id, formId } = req.params;
        const { response } = req.body;
        const responseId = uuidv4();
        // Crea una referencia a la ubicación en la base de datos específica para ese usuario
        const formStructuresRef = ref(
          db,
          `users/${id}/forms/${formId}/responses/${responseId}`
        );
        console.log(req.body)
        set(formStructuresRef, {
            ...response,
        }).then((response) => {

            console.log(
              "Datos de respuesta guardados con éxito con tu propio ID único"
            );
            return res.status(201).send({ response })
        })
        .catch((err) => {
            console.error("Error al guardar datos de respuesta:", err);
            return handleError(res, err)
        });

    } catch (err) {
        return handleError(res, err);
    }
}
  
async function getResponses(req , res) {
    try {
        const { id } = req.params;
        // Crea una referencia a la ubicación en la base de datos específica para ese usuario
        const formStructuresRef = ref(
          db,
          `users/${id}/forms/`
        );
        console.log(req.body)
        console.log(formStructuresRef)
        const snapshot = await get(formStructuresRef);
        if (snapshot.exists()) {
          // Obtener todos los formularios del usuario
          const forms = snapshot.val();
          return res.status(200).send(convertObjtoArray(forms));
        } else {
          console.log(" No hay formularios.");
          return res.status(200).send({forms});
        }
      } catch (err) {
        console.error("Error al obtener los formularios:", err);
        return handleError(res, err);
      }
}

async function getResponsesById(req , res) {
    try {
        const { id , formId} = req.params;
        // Crea una referencia a la ubicación en la base de datos específica para ese usuario
        const formStructuresRef = ref(
          db,
          `users/${id}/forms/${formId}`
        );
        const snapshot = await get(formStructuresRef);
        console.log(snapshot)
        if (snapshot.exists()) {
          // Obtener todos los formularios del usuario
          const forms = snapshot.val();
          console.log(forms)
          return res.status(200).send(forms.responses ? formatResponses(forms): forms);
        } else {
          console.log(" No hay formularios.");
          return res.status(200).send({});
        }
      } catch (err) {
        console.error("Error al obtener los formularios:", err);
        return handleError(res, err);
      }
}
  

module.exports = {
    getToken,
    create,
    all,
    getUser,
    patch,
    removeUser,
    getForms,
    getFormsById,
    saveUserData,
    saveForm,
    updateForm,
    removeForm,
    saveResponseForm,
    getResponses,
    getResponsesById
};
