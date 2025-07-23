document.addEventListener('deviceready', function () {
    const contactList = document.getElementById("contactList");
    let contactsGlobaux = []; // Pour les contacts du téléphone
    let contactsLocaux = JSON.parse(localStorage.getItem('contactsLocaux')) || []; // Pour les contacts ajoutés via l'app
    let indexContactActuel = null;
    let isLocalContact = false;

    // Charger les contacts du téléphone
    function loadContacts() {
        let options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        let fields = ["displayName", "phoneNumbers", "emails", "addresses", "organizations"];

        navigator.contacts.find(fields, function(liste) {
            contactsGlobaux = liste;
            showContacts([...contactsLocaux, ...contactsGlobaux]);
        }, erreurContacts, options);
    }

    // Afficher la liste combinée des contacts
    function showContacts(liste) {
        contactList.innerHTML = "";

        liste.forEach((contact, index) => {
            if (!contact.displayName || !contact.phoneNumbers || contact.phoneNumbers.length === 0) return;

            const li = document.createElement("li");
            li.innerHTML = `
                <a href="#contactDetails" class="contact-item" data-index="${index}">
                    <img src="img/avatar.png" class="avatar" />
                    <h2>${contact.displayName}</h2>
                    <p>${contact.phoneNumbers[0].value}</p>
                </a>
            `;
            contactList.appendChild(li);
        });

        $("#contactList").listview("refresh");
    }

    function erreurContacts(e) {
        alert("Erreur lors de la récupération des contacts : " + e.code);
        showContacts(contactsLocaux); // Afficher au moins les contacts locaux
    }

    // Gestion de l'ajout de contact
    document.getElementById("contactForm").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const newContact = {
            id: Date.now().toString(),
            displayName: document.getElementById("prenom").value + " " + document.getElementById("nom").value,
            phoneNumbers: [{ value: document.getElementById("telephone").value }],
            emails: [{ value: document.getElementById("email").value || "" }],
            organizations: [{ 
                name: document.getElementById("organisation").value || "",
                title: document.getElementById("job").value || ""
            }],
            addresses: [{ formatted: "" }],
            isLocal: true // Marquer comme contact local
        };

        contactsLocaux.push(newContact);
        localStorage.setItem('contactsLocaux', JSON.stringify(contactsLocaux));
        
        $("#addContactPopup").popup("close");
        showContacts([...contactsLocaux, ...contactsGlobaux]);
        this.reset();
    });

    // Affichage des détails du contact
    $(document).on("click", ".contact-item", function() {
        indexContactActuel = $(this).data("index");
        const tousContacts = [...contactsLocaux, ...contactsGlobaux];
        const contact = tousContacts[indexContactActuel];

        isLocalContact = contact.isLocal || false;

        if (contact) {
            document.getElementById("detailsNom").textContent = contact.displayName;
            document.getElementById("detailsTelephone").textContent = contact.phoneNumbers?.[0]?.value || "Non renseigné";
            document.getElementById("detailsEmail").textContent = contact.emails?.[0]?.value || "Non renseigné";
            document.getElementById("detailsOrganisation").textContent = contact.organizations?.[0]?.name || "Non renseignée";

            // Pré-remplir le formulaire de modification si contact local
            if (isLocalContact) {
                const names = contact.displayName.split(' ');
                document.getElementById("editPrenom").value = names[0] || '';
                document.getElementById("editNom").value = names.slice(1).join(' ') || '';
                document.getElementById("editTelephone").value = contact.phoneNumbers?.[0]?.value || '';
                document.getElementById("editEmail").value = contact.emails?.[0]?.value || '';
                document.getElementById("editOrganisation").value = contact.organizations?.[0]?.name || '';
                document.getElementById("editJob").value = contact.organizations?.[0]?.title || '';
            }
        }
    });

    // Modification de contact
    $(document).on("click", "#contactDetails a[data-icon='edit']", function() {
        if (!isLocalContact) {
            alert("La modification n'est possible que pour les contacts ajoutés via l'application.");
            return;
        }
        $("#editContactPopup").popup("open");
    });

    document.getElementById("editContactForm").addEventListener("submit", function(e) {
        e.preventDefault();
        
        if (indexContactActuel !== null && isLocalContact) {
            const updatedContact = {
                id: contactsLocaux[indexContactActuel].id,
                displayName: document.getElementById("editPrenom").value + " " + document.getElementById("editNom").value,
                phoneNumbers: [{ value: document.getElementById("editTelephone").value }],
                emails: [{ value: document.getElementById("editEmail").value || "" }],
                organizations: [{ 
                    name: document.getElementById("editOrganisation").value || "",
                    title: document.getElementById("editJob").value || ""
                }],
                addresses: [{ formatted: "" }],
                isLocal: true
            };

            contactsLocaux[indexContactActuel] = updatedContact;
            localStorage.setItem('contactsLocaux', JSON.stringify(contactsLocaux));
            
            $("#editContactPopup").popup("close");
            showContacts([...contactsLocaux, ...contactsGlobaux]);
            $.mobile.changePage("#contactDetails");
        }
    });

    // Suppression de contact
    $(document).on("click", "#contactDetails a[data-icon='delete']", function() {
        if (!isLocalContact) {
            alert("La suppression n'est possible que pour les contacts ajoutés via l'application.");
            return;
        }
        
        if (confirm("Voulez-vous vraiment supprimer ce contact ?")) {
            contactsLocaux.splice(indexContactActuel, 1);
            localStorage.setItem('contactsLocaux', JSON.stringify(contactsLocaux));
            showContacts([...contactsLocaux, ...contactsGlobaux]);
            $.mobile.changePage("#homepage");
        }
    });

    // Demande de permission et chargement initial
    const permissions = cordova.plugins.permissions;
    permissions.requestPermission(
        permissions.READ_CONTACTS,
        function (status) {
            if (status.hasPermission) {
                loadContacts();
            } else {
                alert("Permission refusée pour accéder aux contacts.");
                showContacts(contactsLocaux);
            }
        },
        function () {
            alert("Erreur lors de la demande de permission.");
            showContacts(contactsLocaux);
        }
    );
});