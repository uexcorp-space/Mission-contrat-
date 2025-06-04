document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const categoriesListEl = document.getElementById('categoriesList');
    const contractsListEl = document.getElementById('contractsList');
    
    const contractDetailTitleTextEl = document.getElementById('contractDetailTitleText');
    const contractDetailsContentAreaEl = document.getElementById('contractDetailsContentArea');

    const acceptOfferBtn = document.getElementById('acceptOfferBtn');
    const playerBalanceEl = document.getElementById('playerBalance');
    const tabLinks = document.querySelectorAll('.tab-link');
    const headerSubtitleEl = document.getElementById('headerSubtitle');


    // Modal Elements
    const modal = document.getElementById('confirmationModal');
    const modalTitleEl = document.getElementById('modalTitle'); // Pour le titre du modal
    const modalContractTitleEl = document.getElementById('modalContractTitle'); // Pour le nom du contrat dans le modal
    const modalActionTextEl = document.getElementById('modalActionText'); // Pour le texte d'action
    const modalCountdownEl = document.getElementById('modalCountdown');
    const confirmAcceptBtnModal = document.getElementById('confirmAcceptBtnModal'); 
    const cancelAcceptBtnModal = document.getElementById('cancelAcceptBtnModal');   
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // --- DONNÉES DE CONTRATS ---
    let contractsData = [
        {
            id: 'merc001', title: 'Remove Claimjumpers', category: 'Mercenary', payment: 10000,
            availabilityType: 'Timed', timeLimitAccept: (49 * 60) + 30, 
            creationTimestamp: Date.now() - (10 * 60 * 1000), 
            from: 'Shubin Interstellar', postingType: 'Security / Mercenary', location: 'CRU L5, Claim #SNS-133',
            workExperience: 'Combat Pilot (Military Experience a Plus)',
            termsHeader: "TERMS*:",
            terms: `A recently acquired Shubin Interstellar mining claim awaiting processing was discovered to have been jumped by a rogue mining outfit who are actively stealing ore from the site. While local authorities have been notified, there is concern that valuable assets may be harvested before an official investigation can be launched.\n\nTherefore, as is our right as claim holders, we wish to secure a mercenary force to go to Mining Claim #UU1-PPU, destroy the orbital sentries that are protecting this illegal operation, and clear the site for Shubin repossession.`,
            disclaimer: `*Shubin Interstellar is an equal opportunity contractor. By accepting this contract you are assuming any and all risks associated with the work outlined herein and in no way can Shubin Interstellar be held accountable for any damages accrued during the duration of the contract.`,
            status: 'Available',
            detailSections: [ 
                { 
                    title: "Delivery", // Correspond à l'image de référence
                    checklist: [ 
                        { text: "Sites and Destroy Narcotics", completed: true },
                        { text: "Payment", completed: false, subItems: ["10000 aUEC"] }
                    ] 
                },
                {
                    title: "Investigation",
                    checklist: [
                        { text: "Remove Claimjumpers", completed: true},
                        { text: "Contract Availability", completed: false, subItems: ["Unspecified"]}
                    ]
                },
                {
                    title: "Maintenance",
                    checklist: [
                        { text: "Remove Claimjumpers", completed: false},
                        { text: "From", completed: false, subItems: ["Shubin Interstellar"]}
                    ]
                },
                {
                    title: "Bounty Hunter",
                    checklist: [
                        { text: "Remove Claimjumpers", completed: false},
                        { text: "LOCATION: CRU LS", completed: false}, // Formaté comme item de checklist
                        { text: "WORK EXPERIENCE: Combat Pilot (Military Experience a Plus)", completed: false},
                        { text: "TERRIFY:", completed: false} // TERRIFY semble être un typo pour TERMS* ou un objectif
                    ],
                    // Le paragraphe est maintenant géré par la section terms principale
                },
                {
                    title: "Mercenary", // Section pour le contrat "Remove Claimjumpers" lui-même
                    checklist: [
                        // Les objectifs spécifiques de "Remove Claimjumpers" iraient ici
                        { text: "Neutralize hostile forces at Mining Claim #UU1-PPU.", completed: false },
                        { text: "Destroy active orbital sentries.", completed: false },
                        { text: "Secure the site for Shubin Interstellar.", completed: false },
                        { text: "A Call to Arms", completed: false}, // Item de l'image
                        { text: "URGENT: Boarding Action In Progress", completed: false} // Item de l'image
                    ]
                }
            ]
        },
        {
            id: 'del001', title: 'UDM Package Pick Up', category: 'Delivery', payment: 45000, 
            availabilityType: 'Unspecified', creationTimestamp: Date.now() - (60 * 60 * 1000),
            from: 'Unified Distribution Management', postingType: 'Delivery / Logistics', location: 'MT SecurityCenter DDV-5 to Shubin Mining Facility SMD-18 (MicroTech)',
            workExperience: 'Greetings Qualified Shipping Partner!', 
            termsHeader: "MISSION BRIEFING:", 
            terms: `If you're looking for work as a delivery pilot, we have the perfect opportunity for you!\n\nA pick up is waiting at MT SecurityCenter DDV-5 to be delivered to Shubin Mining Facility SMD-18 on MicroTech. Sounds fun, right?\n\nWarning, there have been multiple security alerts flagged in the area. Be sure to bring along some defensive measures so you can stay safe.\n\nIf this sounds like something you're interested in, accept this offer right away!\n\nLooking forward to working with you,\n\nUnified Distribution Management\n-Delivering the Total Package-`,
            disclaimer: ``, 
            status: 'Available',
            detailSections: [
                { title: "Pickup Details", checklist: [{ text: "Collect package: MT SecurityCenter DDV-5.", completed: false }] },
                { title: "Delivery Details", checklist: [{ text: "Deliver package: Shubin Mining Facility SMD-18, MicroTech.", completed: false }] },
                { title: "Special Conditions", checklist: [{ text: "Package integrity must be maintained.", completed: false }]}
            ]
        },
        // ... (les autres contrats que nous avions : inv001, maint001 peuvent être ajoutés ici avec la structure detailSections)
    ];

    let playerUEC = 6730581; 
    let currentTab = 'general';
    let currentCategory = 'All'; 
    let selectedContractId = null;
    let modalCountdownInterval;
    let contractTimersInterval;

    // --- UTILITY FUNCTIONS ---
    function formatUEC(amount) { return amount.toLocaleString('en-US') + ' aUEC'; }

    function formatRemainingTime(totalSeconds) {
        if (totalSeconds <= 0) return 'Expired';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60); 
        return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
    }

    function isContractExpired(contract) {
        if (contract.availabilityType === 'Timed' && contract.status === 'Available') {
            const elapsedTime = Math.floor((Date.now() - contract.creationTimestamp) / 1000);
            return elapsedTime >= contract.timeLimitAccept;
        }
        return false;
    }
    
    // --- DOM UPDATE FUNCTIONS ---
    function updatePlayerBalanceDisplay() { playerBalanceEl.textContent = formatUEC(playerUEC); }
    function updateHeaderSubtitle(text) { if(headerSubtitleEl) headerSubtitleEl.textContent = text; }


    function getFilteredContracts() {
        let filtered = contractsData;
        if (currentTab === 'general') {
            filtered = filtered.filter(c => c.status === 'Available' && !isContractExpired(c));
        } else if (currentTab === 'accepted') {
            filtered = filtered.filter(c => c.status === 'Accepted');
        } else if (currentTab === 'history') {
            filtered = filtered.filter(c => ['Completed', 'Failed', 'Expired'].includes(c.status) || (c.status === 'Available' && isContractExpired(c)));
        } else { filtered = []; }

        if (currentCategory && currentCategory !== 'All') {
            filtered = filtered.filter(contract => contract.category === currentCategory);
        }
        return filtered.sort((a,b) => (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : -1);
    }

    function renderCategories() {
        categoriesListEl.innerHTML = '';
        const relevantContractsForTab = contractsData.filter(contract => {
             if (currentTab === 'general') return contract.status === 'Available' && !isContractExpired(contract);
             if (currentTab === 'accepted') return contract.status === 'Accepted';
             if (currentTab === 'history') return ['Completed', 'Failed', 'Expired'].includes(contract.status) || (contract.status === 'Available' && isContractExpired(contract));
             return false; 
        });

        const categories = {};
        relevantContractsForTab.forEach(contract => {
            categories[contract.category] = (categories[contract.category] || 0) + 1;
        });
        
        // Ajouter les catégories fixes de l'image si elles n'ont pas de contrats, avec compteur 0
        const fixedCategories = ["Delivery", "Search", "Investigation", "Maintenance", "Bounty Hunter", "Mercenary", "ECN Alert", "Other"];
        fixedCategories.forEach(catName => {
            if (!categories[catName]) {
                categories[catName] = 0;
            }
        });
        
        const sortedCategories = Object.keys(categories).sort((a,b) => fixedCategories.indexOf(a) - fixedCategories.indexOf(b));


        const allCount = relevantContractsForTab.length;
        const allLi = document.createElement('li');
        allLi.innerHTML = `<span class="category-name">All</span> <span class="category-count">${allCount}</span>`;
        allLi.dataset.category = 'All';
        if (currentCategory === 'All') allLi.classList.add('active');
        allLi.addEventListener('click', () => { currentCategory = 'All'; selectedContractId = null; renderUI(); });
        categoriesListEl.appendChild(allLi);
        
        sortedCategories.forEach(categoryName => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="category-name">${categoryName}</span> <span class="category-count">${categories[categoryName]}</span>`;
            li.dataset.category = categoryName;
            if (categoryName === currentCategory) li.classList.add('active');
            li.addEventListener('click', () => { currentCategory = categoryName; selectedContractId = null; renderUI(); });
            categoriesListEl.appendChild(li);
        });
    }
    
    function renderContracts() {
        contractsListEl.innerHTML = '';
        const filteredContracts = getFilteredContracts();

        if (filteredContracts.length === 0) {
            contractsListEl.innerHTML = '<li class="no-contracts-placeholder">No contracts available for this category.</li>';
            return;
        }

        filteredContracts.forEach(contract => {
            const li = document.createElement('li');
            li.dataset.id = contract.id;
            
            let expiryText = '';
            if (contract.availabilityType === 'Timed' && contract.status === 'Available' && !isContractExpired(contract)) {
                const timeLeft = contract.timeLimitAccept - Math.floor((Date.now() - contract.creationTimestamp) / 1000);
                expiryText = `<span class="contract-item-expiry" data-contract-id-timer="${contract.id}">Accept within: ${formatRemainingTime(timeLeft)}</span>`;
            } else if (isContractExpired(contract) && contract.status === 'Available') {
                 expiryText = `<span class="contract-item-expiry">Expired</span>`;
            }

            let metaText = `${contract.category} - ${formatUEC(contract.payment)}`;
            // Gérer les cas spécifiques de meta-text vus dans l'image
            if (contract.title === "UDM Local Delivery Route - 8000 aUEC") { // Exemple de l'image SC
                 metaText = `Origin 325m <i class="fas fa-long-arrow-alt-right"></i> DESTINATION <i class="fas fa-long-arrow-alt-right"></i> 82m`;
            } else if (contract.title === "URGENT: Boarding Action In Progress") {
                metaText = `Mercenary - High Threat`; // Exemple
            }


            li.innerHTML = `
                <span class="contract-item-title">${contract.title}</span>
                <span class="contract-item-meta">${metaText}</span>
                ${expiryText}
            `;
            if (contract.id === selectedContractId) li.classList.add('active');
            
            li.addEventListener('click', () => { selectedContractId = contract.id; renderUI(); });
            contractsListEl.appendChild(li);
        });
    }

    function renderContractDetails() {
        const placeholder = contractDetailsContentAreaEl.querySelector('.placeholder-text');

        if (!selectedContractId) {
            contractDetailTitleTextEl.textContent = ''; 
            contractDetailsContentAreaEl.innerHTML = '<p class="placeholder-text">Select a contract to view details.</p>';
            acceptOfferBtn.style.display = 'none';
            updateHeaderSubtitle("Select a Faction/Organization"); // Ou un texte par défaut
            return;
        }

        const contract = contractsData.find(c => c.id === selectedContractId);
        if (!contract) {
            contractDetailTitleTextEl.textContent = 'Error';
            contractDetailsContentAreaEl.innerHTML = '<p class="placeholder-text">Error: Contract not found.</p>';
            acceptOfferBtn.style.display = 'none';
            updateHeaderSubtitle("Error");
            return;
        }

        if (placeholder) placeholder.style.display = 'none'; 
        contractDetailTitleTextEl.textContent = contract.title; 
        updateHeaderSubtitle(contract.from); 

        let availabilityDisplay = contract.availabilityType === 'Unspecified' ? 'Unspecified' : contract.status; 
        if (contract.availabilityType === 'Timed' && contract.status === 'Available' && !isContractExpired(contract)) {
            const timeLeft = contract.timeLimitAccept - Math.floor((Date.now() - contract.creationTimestamp) / 1000);
            availabilityDisplay = `Timed (Accept within: <span data-contract-id-detail-timer="${contract.id}">${formatRemainingTime(timeLeft)}</span>)`;
        } else if (isContractExpired(contract) && contract.status === 'Available') {
            availabilityDisplay = 'Expired';
        }

        let detailsHTML = `
            <div class="contract-info-grid">
                <span class="label"><i class="fas fa-coins"></i> Payment:</span> <span class="value">${formatUEC(contract.payment)}</span>
                <span class="label"><i class="fas fa-clock"></i> Contract Availability:</span> <span class="value">${availabilityDisplay}</span>
                <span class="label"><i class="fas fa-user-tie"></i> From:</span> <span class="value">${contract.from}</span>
                <span class="label"><i class="fas fa-file-alt"></i> Posting:</span> <span class="value">${contract.postingType}</span>
                <span class="label"><i class="fas fa-map-marker-alt"></i> Location:</span> <span class="value">${contract.location}</span>
                <span class="label"><i class="fas fa-briefcase"></i> Experience:</span> <span class="value">${contract.workExperience}</span>
            </div>
        `;

        if (contract.detailSections && contract.detailSections.length > 0) {
            contract.detailSections.forEach(section => {
                detailsHTML += `<div class="contract-details-section"><h4>${section.title}</h4>`;
                if (section.checklist && section.checklist.length > 0) {
                    detailsHTML += `<ul class="contract-checklist">`;
                    section.checklist.forEach(item => {
                        detailsHTML += `<li class="${item.completed ? 'completed' : ''}">${item.text}`;
                        if (item.subItems && item.subItems.length > 0) {
                            detailsHTML += `<ul>`;
                            item.subItems.forEach(sub => detailsHTML += `<li>${sub}</li>`);
                            detailsHTML += `</ul>`;
                        }
                        detailsHTML += `</li>`;
                    });
                    detailsHTML += `</ul>`;
                }
                if(section.paragraph) { 
                    detailsHTML += `<p>${section.paragraph.replace(/\n/g, '<br>')}</p>`;
                }
                detailsHTML += `</div>`;
            });
        }
        
        detailsHTML += `
            <div class="contract-terms">
                ${contract.termsHeader ? `<h3>${contract.termsHeader}</h3>` : ''}
                <p>${contract.terms.replace(/\n/g, '<br>')}</p>
                ${contract.disclaimer ? `<p class="disclaimer">${contract.disclaimer.replace(/\n/g, '<br>')}</p>` : ''}
            </div>
        `;

        contractDetailsContentAreaEl.innerHTML = detailsHTML;

        if (contract.status === 'Available' && !isContractExpired(contract) && currentTab === 'general') {
            acceptOfferBtn.style.display = 'block';
            acceptOfferBtn.disabled = false;
            acceptOfferBtn.dataset.contractId = contract.id;
        } else {
            acceptOfferBtn.style.display = 'none';
        }
    }

    // --- MODAL LOGIC ---
    function openModal(contractId) {
        const contract = contractsData.find(c => c.id === contractId);
        if (!contract) return;

        if(modalTitleEl) modalTitleEl.textContent = "Confirm Acceptance"; // Titre par défaut
        if(modalActionTextEl) modalActionTextEl.textContent = "Accept this contract?"; // Texte par défaut

        modalContractTitleEl.textContent = contract.title;
        modal.style.display = 'flex';
        let countdown = 5;
        modalCountdownEl.textContent = `Confirming in ${countdown}s...`;
        clearInterval(modalCountdownInterval);
        modalCountdownInterval = setInterval(() => {
            countdown--;
            modalCountdownEl.textContent = `Confirming in ${countdown}s...`;
            if (countdown <= 0) { clearInterval(modalCountdownInterval); closeModal(); }
        }, 1000);
        confirmAcceptBtnModal.onclick = () => confirmContractAcceptance(contractId);
    }

    function closeModal() {
        clearInterval(modalCountdownInterval);
        modal.style.display = 'none';
    }

    function confirmContractAcceptance(contractId) {
        const contract = contractsData.find(c => c.id === contractId);
        if (contract && contract.status === 'Available' && !isContractExpired(contract)) {
            contract.status = 'Accepted';
            selectedContractId = null; 
            currentCategory = 'All'; 
            switchTabAndUpdateUI('accepted'); 
        } else {
             alert('Failed to accept: Contract no longer available or expired.');
        }
        closeModal();
    }
    
    // --- EVENT HANDLERS ---
    acceptOfferBtn.addEventListener('click', () => {
        const contractId = acceptOfferBtn.dataset.contractId;
        const contract = contractsData.find(c => c.id === contractId);
        if (contract && contract.status === 'Available' && !isContractExpired(contract)) {
            openModal(contractId);
        } else {
            alert('This contract is no longer available or has expired.');
            renderUI(); 
        }
    });

    modalCloseBtn.addEventListener('click', closeModal);
    cancelAcceptBtnModal.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTabAndUpdateUI(link.dataset.tab);
        });
    });
    
    // --- CORE LOGIC ---
    function switchTabAndUpdateUI(tabId) {
        currentTab = tabId;
        currentCategory = 'All'; 
        selectedContractId = null; 

        tabLinks.forEach(tl => tl.classList.toggle('active', tl.dataset.tab === tabId));
        renderUI();
    }
    
    function updateContractTimers() {
        let UINeedsRefresh = false;
        contractsData.forEach(contract => {
            if (contract.availabilityType === 'Timed' && contract.status === 'Available') {
                const isNowExpired = isContractExpired(contract);
                const timeLeft = contract.timeLimitAccept - Math.floor((Date.now() - contract.creationTimestamp) / 1000);

                const timerElList = contractsListEl.querySelector(`.contract-item-expiry[data-contract-id-timer="${contract.id}"]`);
                if (timerElList) {
                    timerElList.textContent = isNowExpired ? 'Expired' : `Accept within: ${formatRemainingTime(timeLeft)}`;
                }
                
                if (selectedContractId === contract.id) {
                    const timerElDetailContainer = contractDetailsContentAreaEl.querySelector(`.value > span[data-contract-id-detail-timer="${contract.id}"]`);
                    if (timerElDetailContainer) {
                         timerElDetailContainer.parentElement.innerHTML = isNowExpired ? 'Expired' : `Timed (Accept within: <span data-contract-id-detail-timer="${contract.id}">${formatRemainingTime(timeLeft)}</span>)`;
                    }
                    if (isNowExpired && acceptOfferBtn.dataset.contractId === contract.id) {
                        acceptOfferBtn.style.display = 'none'; 
                    }
                }
                if (isNowExpired && !contract.justMarkedExpired) { 
                    contract.justMarkedExpired = true; 
                    UINeedsRefresh = true;
                } else if (!isNowExpired) {
                    contract.justMarkedExpired = false;
                }
            }
        });

        if (UINeedsRefresh) {
            renderUI(); 
        }
    }

    function renderUI() {
        renderCategories();
        renderContracts();
        renderContractDetails(); 
    }

    // --- INITIAL SETUP ---
    updatePlayerBalanceDisplay();
    updateHeaderSubtitle("SHUBIN INTERSTELLAR"); 
    switchTabAndUpdateUI('general'); 
    contractTimersInterval = setInterval(updateContractTimers, 1000);
});