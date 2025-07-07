
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById("contactForm");
    const contactList = document.getElementById("contactList");
//###### Charger la liste des contacts quand homepage s'affiche 
    const contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    afficherContacts(contacts);

//#####Ajouter contacts 
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

       // 🔁 Recharge toujours la dernière version depuis localStorage
    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

      const prenom = document.getElementById("prenom").value.trim();
      const nom = document.getElementById("nom").value.trim();
      const telephone = document.getElementById("telephone").value.trim();
      const email = document.getElementById("email").value.trim();
      const organisation = document.getElementById("organisation").value.trim();
      const job = document.getElementById("job").value.trim();

      if (prenom && nom && telephone) {
        const nouveauContact = { prenom, nom, telephone, email, organisation, job };
        contacts.push(nouveauContact);

        localStorage.setItem("contacts", JSON.stringify(contacts));

        afficherContacts(contacts);
        contactForm.reset();
        $("#addContactPopup").popup("close");
      } else {
        alert("Veuillez remplir au moins prénom, nom et téléphone.");
      }
    });

//###### Afficher la liste des contacts sur homepage
    function afficherContacts(liste) {
    contactList.innerHTML = "";
    liste.forEach((contact, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
        <a href="#contactDetails" class="contact-item" data-index="${index}">
            <img src="img/avatar.png" class="avatar" />
            <h2>${contact.prenom} ${contact.nom}</h2>
            <p>${contact.telephone}</p>
        </a>
        `;
        contactList.appendChild(li);
    });

    $("#contactList").listview("refresh");
    }

   //######## Quand on clique sur un contact : afficher ses informations
    let indexContactActuel = null; // 🆕 globale
    $(document).on("click", ".contact-item", function () {
    indexContactActuel = $(this).data("index"); // 🆕 stocker l’index
    const contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    const contact = contacts[indexContactActuel];

    if (contact) {
        document.getElementById("detailsNom").textContent = `${contact.prenom} ${contact.nom}`;
        document.getElementById("detailsTelephone").textContent = contact.telephone;
        document.getElementById("detailsEmail").textContent = contact.email || "Non renseigné";
        document.getElementById("detailsOrganisation").textContent = contact.organisation || "Non renseignée";
        document.getElementById("detailsJob").textContent = contact.job || "Non renseignée";
    }
    });


//####Modidier un contact data-icon edit
   //Affichage sur un popup
    $(document).on("click", "#contactDetails a[data-icon='edit']", function () {
        const contacts = JSON.parse(localStorage.getItem("contacts")) || [];
        const contact = contacts[indexContactActuel];

        if (!contact) return;

        // Pré-remplir la popup de modification
        $("#editPrenom").val(contact.prenom);
        $("#editNom").val(contact.nom);
        $("#editTelephone").val(contact.telephone);
        $("#editEmail").val(contact.email);
        $("#editOrganisation").val(contact.organisation);
        $("#editJob").val(contact.job);

        // Ouvrir la popup
        $("#editContactPopup").popup("open");
        });
    //Soummission du formulaire 
     document.getElementById("editContactForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const contacts = JSON.parse(localStorage.getItem("contacts")) || [];

        const updatedContact = {
            prenom: document.getElementById("editPrenom").value.trim(),
            nom: document.getElementById("editNom").value.trim(),
            telephone: document.getElementById("editTelephone").value.trim(),
            email: document.getElementById("editEmail").value.trim(),
            organisation: document.getElementById("editOrganisation").value.trim(),
            job: document.getElementById("editJob").value.trim()
        };

        if (indexContactActuel !== null) {
            contacts[indexContactActuel] = updatedContact;
            localStorage.setItem("contacts", JSON.stringify(contacts));
            afficherContacts(contacts);
            $("#editContactPopup").popup("close");

            // Mettre à jour aussi la page de détails
            document.getElementById("detailsNom").textContent = `${updatedContact.prenom} ${updatedContact.nom}`;
            document.getElementById("detailsTelephone").textContent = updatedContact.telephone;
            document.getElementById("detailsEmail").textContent = updatedContact.email || "Non renseigné";
            document.getElementById("detailsOrganisation").textContent = updatedContact.organisation || "Non renseignée";
            document.getElementById("detailsJob").textContent = updatedContact.job || "Non renseignée";
        }
        });



//######Supprimer un contact data-icon delete 
        $(document).on("click", "#contactDetails a[data-icon='delete']", function () {
            if (confirm("Voulez-vous vraiment supprimer ce contact ?")) {
                const contacts = JSON.parse(localStorage.getItem("contacts")) || [];

                if (indexContactActuel !== null) {
                contacts.splice(indexContactActuel, 1); // Supprime le contact
                localStorage.setItem("contacts", JSON.stringify(contacts));
                indexContactActuel = null;

                // Recharger la liste principale
                afficherContacts(contacts);

                // Retour à la page d’accueil
                $.mobile.changePage("#homepage");
                }
            }
            });



  });

