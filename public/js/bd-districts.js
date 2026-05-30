const bdLocations = {
    "Dhaka": ["Adabor", "Badda", "Bangshal", "Bimanbandar", "Cantonment", "Chawkbazar", "Dakshinkhan", "Darus Salam", "Demra", "Dhamrai", "Dhanmondi", "Dohar", "Gendaria", "Gulshan", "Hazaribagh", "Jatrabari", "Kadamtali", "Kafrul", "Kalabagan", "Kamrangirchar", "Keraniganj", "Khilgaon", "Khilkhet", "Kotwali", "Lalbagh", "Mirpur", "Mohammadpur", "Motijheel", "Nawabganj", "New Market", "Pallabi", "Paltan", "Ramna", "Rampura", "Sabujbagh", "Savar", "Shah Ali", "Shahbagh", "Sher-e-Bangla Nagar", "Shyampur", "Sutrapur", "Tejgaon", "Turag", "Uttara", "Uttarkhan"],
    "Faridpur": ["Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Faridpur Sadar", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"],
    "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
    "Gopalganj": ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
    "Kishoreganj": ["Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kishoreganj Sadar", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"],
    "Madaripur": ["Kalkini", "Madaripur Sadar", "Rajoir", "Shibchar"],
    "Manikganj": ["Daulatpur", "Ghior", "Harirampur", "Manikganj Sadar", "Saturia", "Shivalaya", "Singair"],
    "Munshiganj": ["Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"],
    "Narayanganj": ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"],
    "Narsingdi": ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"],
    "Rajbari": ["Baliakandi", "Goalandaghat", "Kalukhali", "Pangsha", "Rajbari Sadar"],
    "Shariatpur": ["Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shariatpur Sadar", "Zajira"],
    "Tangail": ["Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar"],

    "Brahmanbaria": ["Akhaura", "Ashuganj", "Bancharampur", "Brahmanbaria Sadar", "Bijoynagar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail"],
    "Comilla": ["Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Comilla Sadar", "Comilla Sadar South", "Daudkandi", "Debidwar", "Homna", "Laksam", "Meghna", "Monohorgonj", "Muradnagar", "Nangalkot", "Titas"],
    "Chandpur": ["Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua", "Matlab North", "Matlab South", "Shahrasti"],
    "Lakshmipur": ["Kamalnagar", "Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati"],
    "Noakhali": ["Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat", "Noakhali Sadar", "Senbagh", "Sonaimuri", "Subarnachar"],
    "Feni": ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram", "Sonagazi"],
    "Khagrachhari": ["Dighinala", "Khagrachhari", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"],
    "Rangamati": ["Bagaichhari", "Barkal", "Kawkhali", "Belaichhari", "Kaptai", "Juraichhari", "Langadu", "Naniarchar", "Rajasthali", "Rangamati Sadar"],
    "Bandarban": ["Ali Kadam", "Bandarban Sadar", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"],
    "Chittagong": ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda", "Chittagong City"],
    "Cox's Bazar": ["Chakaria", "Cox's Bazar Sadar", "Kutubdia", "Maheshkhali", "Ramu", "Teknaf", "Ukhia", "Pekua"],

    "Sylhet": ["Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Dakshin Surma", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmaninagar", "Sylhet Sadar", "Zakiganj"],
    "Moulvibazar": ["Barlekha", "Juri", "Kamalganj", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal"],
    "Habiganj": ["Ajmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj", "Shayestaganj"],
    "Sunamganj": ["Bishwamvarpur", "Chhatak", "Dakshin Sunamganj", "Derai", "Dharamapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Sunamganj Sadar", "Tahirpur"],

    "Khulna": ["Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgacha", "Phultala", "Rupsha", "Terokhada", "Khulna City"],
    "Bagerhat": ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
    "Chuadanga": ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"],
    "Jessore": ["Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Jessore Sadar", "Manirampur", "Sharsha"],
    "Jhenaidah": ["Harinakunda", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
    "Kushtia": ["Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur"],
    "Magura": ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
    "Meherpur": ["Gangni", "Meherpur Sadar", "Mujibnagar"],
    "Narail": ["Kalia", "Lohagara", "Narail Sadar"],
    "Satkhira": ["Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Satkhira Sadar", "Shyamnagar", "Tala"],

    "Barishal": ["Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Barishal Sadar", "Mehendiganj", "Muladi", "Wazirpur"],
    "Barguna": ["Amtali", "Bamna", "Barguna Sadar", "Betagi", "Patharghata", "Taltali"],
    "Bhola": ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
    "Jhalokati": ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
    "Patuakhali": ["Bauphal", "Dashmina", "Dumki", "Galachipa", "Kala Para", "Mirzaganj", "Patuakhali Sadar", "Rangabali"],
    "Pirojpur": ["Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Pirojpur Sadar", "Zianagar"],

    "Rajshahi": ["Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore", "Rajshahi City"],
    "Bogra": ["Adamdighi", "Bogra Sadar", "Dhunat", "Dupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatola"],
    "Joypurhat": ["Akkelpur", "Joypurhat Sadar", "Kalai", "Khetlal", "Panchbibi"],
    "Naogaon": ["Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mohadevpur", "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"],
    "Natore": ["Baraigram", "Gurudaspur", "Lalpur", "Naldanga", "Natore Sadar", "Singra", "Bagatipara"],
    "Nawabganj": ["Bholahat", "Gomastapur", "Nachole", "Nawabganj Sadar", "Shibganj"],
    "Pabna": ["Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Pabna Sadar", "Santhia", "Sujanagar"],
    "Sirajganj": ["Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullahpara"],

    "Rangpur": ["Badarganj", "Gangachhara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Rangpur Sadar", "Taraganj"],
    "Dinajpur": ["Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Dinajpur Sadar", "Nawabganj", "Parbatipur"],
    "Gaibandha": ["Phulchhari", "Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur", "Sughatta", "Sundarganj"],
    "Kurigram": ["Bhurungamari", "Char Rajibpur", "Chilmari", "Phulbari", "Kurigram Sadar", "Nageshwari", "Rajarhat", "Raomari", "Ulipur"],
    "Lalmonirhat": ["Aditmari", "Hatibandha", "Kaliganj", "Lalmonirhat Sadar", "Patgram"],
    "Nilphamari": ["Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Nilphamari Sadar", "Saidpur"],
    "Panchagarh": ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tetulia"],
    "Thakurgaon": ["Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar"],

    "Mymensingh": ["Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Mymensingh Sadar", "Nandail", "Phulpur", "Tara Khanda", "Trishal"],
    "Jamalpur": ["Baksiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandaha", "Sarishabari"],
    "Netrokona": ["Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala"],
    "Sherpur": ["Jhenaigati", "Nakla", "Nalitabari", "Sherpur Sadar", "Sreebardi"]
};

function populateDivisions(selectElementId, selectedDiv = '') {
    const select = document.getElementById(selectElementId);
    if (!select) return;
    
    // Check if options are already populated (more than the placeholder)
    if (select.options.length > 2) return; // Wait, let's just clear and rebuild to be safe
    
    select.innerHTML = '<option value="" disabled selected>জেলা নির্বাচন করুন</option>';
    
    const sortedDivisions = Object.keys(bdLocations).sort();
    sortedDivisions.forEach(div => {
        const option = document.createElement('option');
        option.value = div;
        option.textContent = div;
        if (div === selectedDiv) option.selected = true;
        select.appendChild(option);
    });
}

function populateUpazilas(divisionSelectId, upazilaSelectId, selectedUpazila = '') {
    const divSelect = document.getElementById(divisionSelectId);
    const upzSelect = document.getElementById(upazilaSelectId);
    if (!divSelect || !upzSelect) return;

    upzSelect.innerHTML = '<option value="" disabled selected>উপজেলা নির্বাচন করুন</option>';
    const division = divSelect.value;
    
    if (division && bdLocations[division]) {
        const upazilas = [...bdLocations[division]].sort();
        upazilas.forEach(upz => {
            const option = document.createElement('option');
            option.value = upz;
            option.textContent = upz;
            if (upz === selectedUpazila) option.selected = true;
            upzSelect.appendChild(option);
        });
        upzSelect.disabled = false;
    } else {
        upzSelect.disabled = true;
    }
}
