let db;
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (e) {
  const db = e.target.result;
  // CREATING pending object store and set sutoIncrement to true
  db.createObjectStore('pending', { autoIncrement: true });
};

request.onsuccess = function (e) {
  db = e.target.result;
  // CHECKING if app is online before reading from the db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (e) {
  // CHECKING if error occurs, log the error
  console.log('There was an error: ' + e.target.errorCode);
};

function saveRecord(record) {
  // CREATING pending db with read/write access
  const transaction = db.transaction(['pending'], 'readwrite');
  // CREATING accessing the pending object store
  const store = transaction.objectStore('pending');
  // USING add method to add record to store
  store.add(record);
}

function checkDatabase() {
  // CREATING transaction variable to open a transaction on the pending db
  const transaction = db.transaction(['pending'], 'readwrite');
  // CREATING the store variable to access the pending object store
  const store = transaction.objectStore('pending');
  // CREATING getAll variable to get all the store records
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    // CHECKING if getting all sotre records successfully
    if (getAll.result.length > 0) {
      // fetch with POST method
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        // RETURNING response as JSON
        .then((response) => response.json())
        .then(() => {
          // if respons return successfully, open a transaction on the pending db
          const transaction = db.transaction(['pending'], 'readwrite');
          //  access the pending object store
          const store = transaction.objectStore('pending');
          // clear all items in the store
          store.clear();
        });
    }
  };
}

// Listen for app coming back online
window.addEventListener('online', checkDatabase);
