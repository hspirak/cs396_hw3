//const e = require("express");

const baseURL = 'http://localhost:8081';
let doctors;
let currDoc;

const attachEventHandlers = () => {
    // once the unordered list has been attached to the DOM
    // (by assigning the #artists container's innerHTML),
    // you can attach event handlers to the DOM:
    console.log("WELL...")
    document.querySelectorAll("aside a").forEach(a => {
        a.onclick = showDetail;
    });
};

const showDetail = ev => {
    var image_text = "";
    const name = ev.currentTarget.text;
    // find the current artist from the artists array:
    const doctor = doctors.filter(doc => doc.name === name)[0];
    console.log("THIS IS THE DOCTOR" + doctor.name)
    if(doctor.image_url)
    {
       image_text =` <img src="${doctor.image_url}" />`;
    }
    // append the artist template to the DOM:
    document.querySelector('#doctor').innerHTML = `
        <h2>${doctor.name}</h2>
        <p>Seasons: ${doctor.seasons}</p>
        ${image_text}
        <button id="edit" class="btn">edit</button>
        <button id="delete" class="btn">delete</button>
    `;
    currDoc = doctor;
    document.querySelector("#edit").onclick = processForm;
    document.querySelector("#delete").onclick = processDelete;

    fetch(`${baseURL}/doctors/${doctor._id}/companions`)
    .then(response => response.json())
    .then(data => {
        const listItems = data.map(item => `
        <li>
            <img src =${item.image_url}></img>${item.name}
        </li>`
    );

        document.querySelector('#companions').innerHTML = `
        <ul>
        ${listItems.join('')}
        </ul>`
    })

}

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
    fetch(`${baseURL}/doctors`)
    .then(response => response.json())
    .then(data => {
        // store the retrieved data in a global variable called "artists"
        doctors = data;
        console.log(data + "NEW")
        const listItems = data.map(item => `
            <li>
                <a href="#" data-id="${item._id}">${item.name}</a>
            </li>`
        );
        document.querySelector("#list").innerHTML = `
            <ul>
                ${listItems.join('')}
            </ul>`
    })
    .then(attachEventHandlers);
};


// invoke this function when the page loads:
initResetButton();


document.querySelector("#newDoc").onclick = ev => {
    document.querySelector("#doctor").innerHTML = 
    `
    <form>
    <!-- Name -->
    <label for="name">Name</label>
    <input type="text" id="name">

    <!-- Seasons -->
    <label for="seasons">Seasons</label>
    <input type="text" id="seasons">

    <!-- Ordering -->
    <label for="ordering">Ordering</label>
    <input type="text" id="ordering" value="${doctors.length+1}">

    <!-- Image -->
    <label for="image_url">Image</label>
    <input type="text" id="image_url">

    <!-- Buttons -->
    <button class="btn btn-main" id="save">Save</button>
    <button class="btn" id="cancel">Cancel</button>
</form>
    `;
    document.querySelector("#companions").innerHTML = "";
    document.querySelector("#save").onclick = processSave
    document.querySelector("#cancel").onclick = processCancel
    console.log("attached")
    }
    
    const processCancel = ev => {
        document.querySelector("#doctor").innerHTML = "";
        document.querySelector("#companions").innerHTML = "";
    }

    const processCancel2 = ev => {
        document.querySelector("#doctor").innerHTML = `
        <h2>${currDoc.name}</h2>
        <p>Seasons: ${currDoc.seasons}</p>
        <img src="${currDoc.image_url}" />
        <button id="edit" class="btn">edit</button>
        <button id="delete" class="btn">delete</button>
    `;
    document.querySelector("#edit").onclick = processForm;
    document.querySelector("#delete").onclick = processDelete;

        /////HHHHHHHEEEEEEEEERRRRRREEEEeee
    }


const processSave = ev => {
    console.log("WOW")
    const data = {
        name: document.getElementById('name').value,
        seasons: document.getElementById('seasons').value.split(','),
        ordering: document.getElementById('ordering').value,
        image_url: document.getElementById('image_url').value
    }
    //var checkString = data.seasons.split(",")
    const isBelowThreshold = (currentValue) => isNaN(currentValue);
    if(!data.name || !data.seasons)
    {
        //document.querySelector("#doctor").innerHTML += "Invalid data. Please enter a name and seasons."
        alert("Please try again and enter both a name and seasons.")
        //return;
    }
    else if( data.seasons.every(isBelowThreshold))
    {
        alert("Please try again: seasons must be a number or list of numbers.")
    }
    else {
    fetch(`${baseURL}/doctors/`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            //console.log(`${response.body.seasons}`)
            if (!response.ok) {
                // send to catch block:
                //throw Error(response.statusText);
                document.querySelector("#doctor").innerHTML += "Invalid data. Please enter a name and seasons."
            } else {
                console.log("ok")
                return response.json();
            }
        })
        .then(data => {
            var pic = "";
            console.log('Success:', data);
            if(data.image_url)
            {
                pic = data.image_url;
            }
            document.querySelector('#doctor').innerHTML = `
                <h2>${data.name}</h2>
                <p>Seasons: ${data.seasons}</p>
                <img src="${pic}" />
                <button id="edit" class="btn">edit</button>
                <button id="delete" class="btn">delete</button>
            `;
            document.querySelector("#edit").onclick = processForm;
            document.querySelector("#delete").onclick = processDelete;
            
        })
        .then(reloadDoc)
        .catch(err => {
            console.error(err);
            alert('Error!');
        });
    ev.preventDefault();
    }
};

const processDelete = ev => {
    console.log("WOW")
    if (!window.confirm(`Are you sure you want to delete ${currDoc.name}?`)) {
        document.querySelector("#doctor").innerHTML = `
        <h2>${currDoc.name}</h2>
        <p>Seasons: ${currDoc.seasons}</p>
        <img src="${currDoc.image_url}" />
        <button id="edit" class="btn">edit</button>
        <button id="delete" class="btn">delete</button>
    `;
    document.querySelector("#edit").onclick = processForm;
    document.querySelector("#delete").onclick = processDelete;
      }
    else {
    fetch(`${baseURL}/doctors/${currDoc._id}`, {
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currDoc)
        })
        .then(response => {
            //console.log(`${response.body.seasons}`)
            if (!response.ok) {
                // send to catch block:
                throw Error(response.statusText);
                //document.querySelector("#doctor").innerHTML += "Invalid data. Please enter a name and seasons."
            } else {
                console.log("ok")
                document.querySelector("#doctor").innerHTML = ""
                document.querySelector("#companions").innerHTML = ""
            }
        })
        .then(reloadDoc)
        .catch(err => {
            console.error(err);
            alert('Error!');
        });
    ev.preventDefault();
    }
};



const processForm = ev => {
    document.querySelector("#doctor").innerHTML = 
    `
    <form>
    <!-- Name -->
    <label for="name">Name</label>
    <input type="text" id="name" value="${currDoc.name}">

    <!-- Seasons -->
    <label for="seasons">Seasons</label>
    <input type="text" id="seasons" value="${currDoc.seasons}">

    <!-- Ordering -->
    <label for="ordering">Ordering</label>
    <input type="text" id="ordering" value="${currDoc.ordering}">

    <!-- Image -->
    <label for="image_url">Image</label>
    <input type="text" id="image_url" value="${currDoc.image_url}">

    <!-- Buttons -->
    <button class="btn btn-main" id="save">Save</button>
    <button class="btn" id="cancel">Cancel</button>
</form>
    `;
    document.querySelector("#save").onclick = processEdit
    document.querySelector("#cancel").onclick = processCancel2
    console.log("attached")
    }
    

const processEdit = ev => {
    console.log("ran")
    //var newData = {};
    const data = {
        name: document.getElementById('name').value,
        seasons: document.getElementById('seasons').value.split(','),
        ordering: document.getElementById('ordering').value,
        image_url: document.getElementById('image_url').value
    }

    console.log("HERE IS THE DOC" + currDoc)
    const isBelowThreshold = (currentValue) => isNaN(currentValue);
    if(!data.name || !data.seasons)
    {
        //document.querySelector("#doctor").innerHTML += "Invalid data. Please enter a name and seasons."
        alert("Please try again and enter both a name and seasons.")
        //return;
    }
    else if( data.seasons.every(isBelowThreshold))
    {
        alert("Please try again: seasons must be a number or list of numbers.")
    }
    else{
    fetch(`${baseURL}/doctors/${currDoc._id}`, {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log("ran again")
            //console.log(`${response.body.seasons}`)
            if (!response.ok) {
                // send to catch block:
                //throw Error(response.statusText);
                document.querySelector("#doctor").innerHTML += "Invalid data. Please enter a name and seasons."
            } else {
                console.log("ok")
                return response.json();
            }
        })
        .then(data => {
            console.log("doing something")
            var pic = "";
            console.log('Success:', data);
            if(data.image_url)
            {
                pic = data.image_url;
            }
            document.querySelector('#doctor').innerHTML = `
                <h2>${data.name}</h2>
                <p>Seasons: ${data.seasons}</p>
                <img src="${pic}" />
                <button id="edit" class="btn">edit</button>
                <button id="delete" class="btn">delete</button>
            `;
            document.querySelector("#edit").onclick = processForm;
            document.querySelector("#delete").onclick = processDelete;
        })
        .then(reloadDoc)



        .catch(err => {
            console.error(err);
            alert('Error!');
        });
    ev.preventDefault();
    }
};

const reloadDoc = () => {
    fetch(`${baseURL}/doctors`)
    .then(response => response.json())
    .then(data => {
        // store the retrieved data in a global variable called "artists"
        doctors = data;
        console.log(data + "NEW")
        const listItems = data.map(item => `
            <li>
                <a href="#" data-id="${item._id}">${item.name}</a>
            </li>`
        );
        document.querySelector("#list").innerHTML = `
            <ul>
                ${listItems.join('')}
            </ul>`
            document.querySelectorAll("aside a").forEach(a => {
                a.onclick = showDetail;})
            
            
    })
}





