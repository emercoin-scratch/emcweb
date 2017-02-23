'use strict';

emcwebApp.controller('EMCLNXController', ['$scope', '$rootScope', '$uibModal', 'EMCLNX', 'Encrypt',
                     function EMCSSHController($scope, $rootScope, $uibModal, EMCLNX, Encrypt) {

    $scope.newContractModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'newModal.html',
            controller: 'NewContractModalController',
            resolve: {}
        });

        modalInstance.rendered.then(function() {
            $('#country').select2({width:"100%"});
        });

        modalInstance.result.then(
            function () {
                $scope.getContracts();
            }
        );
    };

    $scope.viewContractModal = function (contract) {
        var modalInstance = $uibModal.open({
            templateUrl: 'contractViewModal.html',
            controller: 'ContractViewModalController',
            resolve: {
                contract: function() {
                    return contract;
                }
            }
        });

        modalInstance.rendered.then(function() {
            $('#country').select2({width:"100%"});
        });

        modalInstance.result.then(
            function (result_data) {
                var deleteModalInstance = $uibModal.open({
                    templateUrl: 'contractDeleteModal.html',
                    controller: 'ContractDeleteModalController',
                    resolve: {
                        contract: function() {
                            return result_data;
                        }
                    }
                });

                deleteModalInstance.result.then(
                    function () {
                        $scope.getContracts();
                    }
                );
            }
        );
    }

    $scope.getContracts = function() {
        $scope.contracts = [];
        EMCLNX.get().$promise.then(function (data) {
            if (data.result_status) {
                $scope.contracts = data.result;
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: data.message});
            }
        });
    }
    
    $scope.$on('update_contracts', function() {
        $scope.getContracts();
    });

    $scope.getContracts();
}]);


emcwebApp.controller('ContractReadyModalController', function ContractReadyModalController($scope, $uibModalInstance, address, domain) {
    $scope.address = address;
    $scope.domain = domain;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('ContractDeleteModalController', function ContractDeleteModalController($scope, $uibModal, $uibModalInstance, $rootScope, EMCLNX, contract, Encrypt) {

    function deleteContract(){
        EMCLNX.del({name: contract.name}).$promise.then(function (data) {
            if (data.result_status) {
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Contract has been deleted'});
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: data.message});
            }
        });
    }

    $scope.contract = contract;

    $scope.unlockWallet = function(status, callback){
        $uibModalInstance.close();
        var modalInstance = $uibModal.open({
            templateUrl: 'lockModal.html',
            controller: 'lockWalletController',
            resolve: {
                status: function () {
                    return status;
                }
            }
        });

        modalInstance.result.then(
            function (result) {
                callback();
            }
        );
    }

    $scope.deleteContract = function () {
        Encrypt.status().$promise.then(function (data) {
            if (data.result_status) {
                if (data.result != 3){
                    $scope.unlockWallet(data.result, deleteContract);
                }else{
                    deleteContract();
                }

            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get wallet status: ' + data.message});
            }
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('ContractViewModalController', function ContractReadyModalController($scope, $uibModalInstance, contract) {
    $scope.countries = [["AF","Afghanistan"],["AL","Albania"],["DZ","Algeria"],["AS","American Samoa"],["AD","Andorra"],["AO","Angola"],["AI","Anguilla"],["AQ","Antarctica"],["AG","Antigua and Barbuda"],["AR","Argentina"],["AM","Armenia"],["AW","Aruba"],["AU","Australia"],["AT","Austria"],["AZ","Azerbaijan"],["BS","Bahamas"],["BH","Bahrain"],["BD","Bangladesh"],["BB","Barbados"],["BY","Belarus"],["BE","Belgium"],["BZ","Belize"],["BJ","Benin"],["BM","Bermuda"],["BT","Bhutan"],["BO","Bolivia (Plurinational State of)"],["BQ","Bonaire, Sint Eustatius and Saba"],["BA","Bosnia and Herzegovina"],["BW","Botswana"],["BV","Bouvet Island"],["BR","Brazil"],["IO","British Indian Ocean Territory"],["BN","Brunei Darussalam"],["BG","Bulgaria"],["BF","Burkina Faso"],["BI","Burundi"],["CV","Cabo Verde"],["KH","Cambodia"],["CM","Cameroon"],["CA","Canada"],["KY","Cayman Islands"],["CF","Central African Republic"],["TD","Chad"],["CL","Chile"],["CN","China"],["CX","Christmas Island"],["CC","Cocos (Keeling) Islands"],["CO","Colombia"],["KM","Comoros"],["CG","Congo"],["CD","Congo (Democratic Republic of the)"],["CK","Cook Islands"],["CR","Costa Rica"],["HR","Croatia"],["CU","Cuba"],["CW","Curacao"],["CY","Cyprus"],["CZ","Czech Republic"],["CI","Cote d\'Ivoire"],["DK","Denmark"],["DJ","Djibouti"],["DM","Dominica"],["DO","Dominican Republic"],["EC","Ecuador"],["EG","Egypt"],["SV","El Salvador"],["GQ","Equatorial Guinea"],["ER","Eritrea"],["EE","Estonia"],["ET","Ethiopia"],["FK","Falkland Islands (Malvinas)"],["FO","Faroe Islands"],["FJ","Fiji"],["FI","Finland"],["FR","France"],["GF","French Guiana"],["PF","French Polynesia"],["TF","French Southern Territories"],["GA","Gabon"],["GM","Gambia"],["GE","Georgia"],["DE","Germany"],["GH","Ghana"],["GI","Gibraltar"],["GR","Greece"],["GL","Greenland"],["GD","Grenada"],["GP","Guadeloupe"],["GU","Guam"],["GT","Guatemala"],["GG","Guernsey"],["GN","Guinea"],["GW","Guinea-Bissau"],["GY","Guyana"],["HT","Haiti"],["HM","Heard Island and McDonald Islands"],["VA","Holy See"],["HN","Honduras"],["HK","Hong Kong"],["HU","Hungary"],["IS","Iceland"],["IN","India"],["ID","Indonesia"],["IR","Iran (Islamic Republic of)"],["IQ","Iraq"],["IE","Ireland"],["IM","Isle of Man"],["IL","Israel"],["IT","Italy"],["JM","Jamaica"],["JP","Japan"],["JE","Jersey"],["JO","Jordan"],["KZ","Kazakhstan"],["KE","Kenya"],["KI","Kiribati"],["KP","Korea (Democratic People\'s Republic of)"],["KR","Korea (Republic of)"],["KW","Kuwait"],["KG","Kyrgyzstan"],["LA","Lao People\'s Democratic Republic"],["LV","Latvia"],["LB","Lebanon"],["LS","Lesotho"],["LR","Liberia"],["LY","Libya"],["LI","Liechtenstein"],["LT","Lithuania"],["LU","Luxembourg"],["MO","Macao"],["MK","Macedonia (the former Yugoslav Republic of)"],["MG","Madagascar"],["MW","Malawi"],["MY","Malaysia"],["MV","Maldives"],["ML","Mali"],["MT","Malta"],["MH","Marshall Islands"],["MQ","Martinique"],["MR","Mauritania"],["MU","Mauritius"],["YT","Mayotte"],["MX","Mexico"],["FM","Micronesia (Federated States of)"],["MD","Moldova (Republic of)"],["MC","Monaco"],["MN","Mongolia"],["ME","Montenegro"],["MS","Montserrat"],["MA","Morocco"],["MZ","Mozambique"],["MM","Myanmar"],["NA","Namibia"],["NR","Nauru"],["NP","Nepal"],["NL","Netherlands"],["NC","New Caledonia"],["NZ","New Zealand"],["NI","Nicaragua"],["NE","Niger"],["NG","Nigeria"],["NU","Niue"],["NF","Norfolk Island"],["MP","Northern Mariana Islands"],["NO","Norway"],["OM","Oman"],["PK","Pakistan"],["PW","Palau"],["PS","Palestine, State of"],["PA","Panama"],["PG","Papua New Guinea"],["PY","Paraguay"],["PE","Peru"],["PH","Philippines"],["PN","Pitcairn"],["PL","Poland"],["PT","Portugal"],["PR","Puerto Rico"],["QA","Qatar"],["RO","Romania"],["RU","Russian Federation"],["RW","Rwanda"],["RE","Reunion"],["BL","Saint Barthelemy"],["SH","Saint Helena, Ascension and Tristan da Cunha"],["KN","Saint Kitts and Nevis"],["LC","Saint Lucia"],["MF","Saint Martin (French part)"],["PM","Saint Pierre and Miquelon"],["VC","Saint Vincent and the Grenadines"],["WS","Samoa"],["SM","San Marino"],["ST","Sao Tome and Principe"],["SA","Saudi Arabia"],["SN","Senegal"],["RS","Serbia"],["SC","Seychelles"],["SL","Sierra Leone"],["SG","Singapore"],["SX","Sint Maarten (Dutch part)"],["SK","Slovakia"],["SI","Slovenia"],["SB","Solomon Islands"],["SO","Somalia"],["ZA","South Africa"],["GS","South Georgia and the South Sandwich Islands"],["SS","South Sudan"],["ES","Spain"],["LK","Sri Lanka"],["SD","Sudan"],["SR","Suriname"],["SJ","Svalbard and Jan Mayen"],["SZ","Swaziland"],["SE","Sweden"],["CH","Switzerland"],["SY","Syrian Arab Republic"],["TW","Taiwan, Province of China[a]"],["TJ","Tajikistan"],["TZ","Tanzania, United Republic of"],["TH","Thailand"],["TL","Timor-Leste"],["TG","Togo"],["TK","Tokelau"],["TO","Tonga"],["TT","Trinidad and Tobago"],["TN","Tunisia"],["TR","Turkey"],["TM","Turkmenistan"],["TC","Turks and Caicos Islands"],["TV","Tuvalu"],["UG","Uganda"],["UA","Ukraine"],["AE","United Arab Emirates"],["GB","United Kingdom of Great Britain and Northern Ireland"],["UM","United States Minor Outlying Islands"],["US","United States of America"],["UY","Uruguay"],["UZ","Uzbekistan"],["VU","Vanuatu"],["VE","Venezuela (Bolivarian Republic of)"],["VN","Viet Nam"],["VG","Virgin Islands (British)"],["VI","Virgin Islands (U.S.)"],["WF","Wallis and Futuna"],["EH","Western Sahara"],["YE","Yemen"],["ZM","Zambia"],["ZW","Zimbabwe"],["AX","Aland Islands"]];
    $scope.languages = [["AB","Abkhazian"],["AA","Afar"],["AF","Afrikaans"],["AK","Akan"],["SQ","Albanian"],["AM","Amharic"],["AR","Arabic"],["AN","Aragonese"],["HY","Armenian"],["AS","Assamese"],["AV","Avaric"],["AE","Avestan"],["AY","Aymara"],["AZ","Azerbaijani"],["BM","Bambara"],["BA","Bashkir"],["EU","Basque"],["BE","Belarusian"],["BN","Bengali"],["BH","Bihari languages"],["BI","Bislama"],["BS","Bosnian"],["BR","Breton"],["BG","Bulgarian"],["MY","Burmese"],["CA","Catalan"],["KM","Central Khmer"],["CH","Chamorro"],["CE","Chechen"],["NY","Chichewa"],["ZH","Chinese"],["CU","Church Slavic"],["CV","Chuvash"],["KW","Cornish"],["CO","Corsican"],["CR","Cree"],["HR","Croatian"],["CS","Czech"],["DA","Danish"],["DV","Divehi"],["NL","Dutch"],["DZ","Dzongkha"],["EN","English"],["EO","Esperanto"],["ET","Estonian"],["EE","Ewe"],["FO","Faroese"],["FJ","Fijian"],["FI","Finnish"],["FR","French"],["FF","Fulah"],["GD","Gaelic"],["GL","Galician"],["LG","Ganda"],["KA","Georgian"],["DE","German"],["EL","Greek"],["GN","Guarani"],["GU","Gujarati"],["HT","Haitian"],["HA","Hausa"],["HE","Hebrew"],["HZ","Herero"],["HI","Hindi"],["HO","Hiri Motu"],["HU","Hungarian"],["IS","Icelandic"],["IO","Ido"],["IG","Igbo"],["ID","Indonesian"],["IA","Interlingua"],["IE","Interlingue; Occidental"],["IU","Inuktitut"],["IK","Inupiaq"],["GA","Irish"],["IT","Italian"],["JA","Japanese"],["JV","Javanese"],["KL","Kalaallisut"],["KN","Kannada"],["KR","Kanuri"],["KS","Kashmiri"],["KK","Kazakh"],["KI","Kikuyu"],["RW","Kinyarwanda"],["KY","Kirghiz"],["KV","Komi"],["KG","Kongo"],["KO","Korean"],["KJ","Kuanyama"],["KU","Kurdish"],["LO","Lao"],["LA","Latin"],["LV","Latvian"],["LI","Limburgan"],["LN","Lingala"],["LT","Lithuanian"],["LU","Luba-Katanga"],["LB","Luxembourgish"],["MK","Macedonian"],["MG","Malagasy"],["MS","Malay"],["ML","Malayalam"],["MT","Maltese"],["GV","Manx"],["MI","Maori"],["MR","Marathi"],["MH","Marshallese"],["MN","Mongolian"],["NA","Nauru"],["NV","Navajo"],["ND","Ndebele"],["NR","Ndebele"],["NG","Ndonga"],["NE","Nepali"],["SE","Northern Sami"],["NO","Norwegian"],["NB","Norwegian Bokmal"],["NN","Norwegian Nynorsk"],["OC","Occitan"],["OJ","Ojibwa"],["OR","Oriya"],["OM","Oromo"],["OS","Ossetian"],["PI","Pali"],["PA","Panjabi"],["FA","Persian"],["PL","Polish"],["PT","Portuguese"],["PS","Pushto"],["QU","Quechua"],["RO","Romanian"],["RM","Romansh"],["RN","Rundi"],["RU","Russian"],["SM","Samoan"],["SG","Sango"],["SA","Sanskrit"],["SC","Sardinian"],["SR","Serbian"],["SN","Shona"],["II","Sichuan Yi"],["SD","Sindhi"],["SI","Sinhala"],["SK","Slovak"],["SL","Slovenian"],["SO","Somali"],["ST","Sotho"],["ES","Spanish"],["SU","Sundanese"],["SW","Swahili"],["SS","Swati"],["SV","Swedish"],["TL","Tagalog"],["TY","Tahitian"],["TG","Tajik"],["TA","Tamil"],["TT","Tatar"],["TE","Telugu"],["TH","Thai"],["BO","Tibetan"],["TI","Tigrinya"],["TO","Tonga"],["TS","Tsonga"],["TN","Tswana"],["TR","Turkish"],["TK","Turkmen"],["TW","Twi"],["UG","Uighur"],["UK","Ukrainian"],["UR","Urdu"],["UZ","Uzbek"],["VE","Venda"],["VI","Vietnamese"],["VO","Volapuk"],["WA","Walloon"],["CY","Welsh"],["FY","Western Frisian"],["WO","Wolof"],["XH","Xhosa"],["YI","Yiddish"],["YO","Yoruba"],["ZA","Zhuang"],["ZU","Zulu"]];
    $scope.contract = contract;
    $scope.domain = $scope.contract.url.replace(/^http(s)?:\/\/([^/]+).*$/, '$2');

    $scope.contract.country = ($scope.contract.countries == 'ALL') ? '' : $scope.contract.countries.split(',');
    $scope.languages.forEach(function(item) {
        if($scope.contract.language == item[0]) {
            $scope.contract.lang = item[1];
        }
    });

    $scope.deleteContract = function () {
        $uibModalInstance.close($scope.contract);
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('NewContractModalController', function NewContractModalController($scope, $rootScope, $uibModal, $uibModalInstance, EMCLNX, Address, Encrypt) {
    function makeContract(){
        var contract = {
            name: $scope.contract.name,
            address: $scope.contract.address,
            url: $scope.contract.url,
            lang: $scope.contract.lang[0],
            country: $('#country').val() ? $('#country').val().join(',') : 'ALL',
            cpc: $scope.contract.cpc,
            keywords: $scope.contract.keywords,
            days: $scope.contract.days,
            txt: $scope.contract.txt,
        }
        EMCLNX.create(contract).$promise.then(function (data) {
            if (data.result_status) {
                $rootScope.$broadcast('update_contracts');

                $uibModal.open({
                    templateUrl: 'contractReadyModal.html',
                    controller: 'ContractReadyModalController',
                    resolve: {
                        address: function() {
                            return contract.address;
                        },
                        domain: function() {
                            return contract.url.replace(/^http(s)?:\/\/([^/]+).*$/, '$2');
                        }
                    }
                });

            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t create new contract: ' + data.message});
            }
        });
    }

    $scope.countries = [["AF","Afghanistan"],["AL","Albania"],["DZ","Algeria"],["AS","American Samoa"],["AD","Andorra"],["AO","Angola"],["AI","Anguilla"],["AQ","Antarctica"],["AG","Antigua and Barbuda"],["AR","Argentina"],["AM","Armenia"],["AW","Aruba"],["AU","Australia"],["AT","Austria"],["AZ","Azerbaijan"],["BS","Bahamas"],["BH","Bahrain"],["BD","Bangladesh"],["BB","Barbados"],["BY","Belarus"],["BE","Belgium"],["BZ","Belize"],["BJ","Benin"],["BM","Bermuda"],["BT","Bhutan"],["BO","Bolivia (Plurinational State of)"],["BQ","Bonaire, Sint Eustatius and Saba"],["BA","Bosnia and Herzegovina"],["BW","Botswana"],["BV","Bouvet Island"],["BR","Brazil"],["IO","British Indian Ocean Territory"],["BN","Brunei Darussalam"],["BG","Bulgaria"],["BF","Burkina Faso"],["BI","Burundi"],["CV","Cabo Verde"],["KH","Cambodia"],["CM","Cameroon"],["CA","Canada"],["KY","Cayman Islands"],["CF","Central African Republic"],["TD","Chad"],["CL","Chile"],["CN","China"],["CX","Christmas Island"],["CC","Cocos (Keeling) Islands"],["CO","Colombia"],["KM","Comoros"],["CG","Congo"],["CD","Congo (Democratic Republic of the)"],["CK","Cook Islands"],["CR","Costa Rica"],["HR","Croatia"],["CU","Cuba"],["CW","Curacao"],["CY","Cyprus"],["CZ","Czech Republic"],["CI","Cote d\'Ivoire"],["DK","Denmark"],["DJ","Djibouti"],["DM","Dominica"],["DO","Dominican Republic"],["EC","Ecuador"],["EG","Egypt"],["SV","El Salvador"],["GQ","Equatorial Guinea"],["ER","Eritrea"],["EE","Estonia"],["ET","Ethiopia"],["FK","Falkland Islands (Malvinas)"],["FO","Faroe Islands"],["FJ","Fiji"],["FI","Finland"],["FR","France"],["GF","French Guiana"],["PF","French Polynesia"],["TF","French Southern Territories"],["GA","Gabon"],["GM","Gambia"],["GE","Georgia"],["DE","Germany"],["GH","Ghana"],["GI","Gibraltar"],["GR","Greece"],["GL","Greenland"],["GD","Grenada"],["GP","Guadeloupe"],["GU","Guam"],["GT","Guatemala"],["GG","Guernsey"],["GN","Guinea"],["GW","Guinea-Bissau"],["GY","Guyana"],["HT","Haiti"],["HM","Heard Island and McDonald Islands"],["VA","Holy See"],["HN","Honduras"],["HK","Hong Kong"],["HU","Hungary"],["IS","Iceland"],["IN","India"],["ID","Indonesia"],["IR","Iran (Islamic Republic of)"],["IQ","Iraq"],["IE","Ireland"],["IM","Isle of Man"],["IL","Israel"],["IT","Italy"],["JM","Jamaica"],["JP","Japan"],["JE","Jersey"],["JO","Jordan"],["KZ","Kazakhstan"],["KE","Kenya"],["KI","Kiribati"],["KP","Korea (Democratic People\'s Republic of)"],["KR","Korea (Republic of)"],["KW","Kuwait"],["KG","Kyrgyzstan"],["LA","Lao People\'s Democratic Republic"],["LV","Latvia"],["LB","Lebanon"],["LS","Lesotho"],["LR","Liberia"],["LY","Libya"],["LI","Liechtenstein"],["LT","Lithuania"],["LU","Luxembourg"],["MO","Macao"],["MK","Macedonia (the former Yugoslav Republic of)"],["MG","Madagascar"],["MW","Malawi"],["MY","Malaysia"],["MV","Maldives"],["ML","Mali"],["MT","Malta"],["MH","Marshall Islands"],["MQ","Martinique"],["MR","Mauritania"],["MU","Mauritius"],["YT","Mayotte"],["MX","Mexico"],["FM","Micronesia (Federated States of)"],["MD","Moldova (Republic of)"],["MC","Monaco"],["MN","Mongolia"],["ME","Montenegro"],["MS","Montserrat"],["MA","Morocco"],["MZ","Mozambique"],["MM","Myanmar"],["NA","Namibia"],["NR","Nauru"],["NP","Nepal"],["NL","Netherlands"],["NC","New Caledonia"],["NZ","New Zealand"],["NI","Nicaragua"],["NE","Niger"],["NG","Nigeria"],["NU","Niue"],["NF","Norfolk Island"],["MP","Northern Mariana Islands"],["NO","Norway"],["OM","Oman"],["PK","Pakistan"],["PW","Palau"],["PS","Palestine, State of"],["PA","Panama"],["PG","Papua New Guinea"],["PY","Paraguay"],["PE","Peru"],["PH","Philippines"],["PN","Pitcairn"],["PL","Poland"],["PT","Portugal"],["PR","Puerto Rico"],["QA","Qatar"],["RO","Romania"],["RU","Russian Federation"],["RW","Rwanda"],["RE","Reunion"],["BL","Saint Barthelemy"],["SH","Saint Helena, Ascension and Tristan da Cunha"],["KN","Saint Kitts and Nevis"],["LC","Saint Lucia"],["MF","Saint Martin (French part)"],["PM","Saint Pierre and Miquelon"],["VC","Saint Vincent and the Grenadines"],["WS","Samoa"],["SM","San Marino"],["ST","Sao Tome and Principe"],["SA","Saudi Arabia"],["SN","Senegal"],["RS","Serbia"],["SC","Seychelles"],["SL","Sierra Leone"],["SG","Singapore"],["SX","Sint Maarten (Dutch part)"],["SK","Slovakia"],["SI","Slovenia"],["SB","Solomon Islands"],["SO","Somalia"],["ZA","South Africa"],["GS","South Georgia and the South Sandwich Islands"],["SS","South Sudan"],["ES","Spain"],["LK","Sri Lanka"],["SD","Sudan"],["SR","Suriname"],["SJ","Svalbard and Jan Mayen"],["SZ","Swaziland"],["SE","Sweden"],["CH","Switzerland"],["SY","Syrian Arab Republic"],["TW","Taiwan, Province of China[a]"],["TJ","Tajikistan"],["TZ","Tanzania, United Republic of"],["TH","Thailand"],["TL","Timor-Leste"],["TG","Togo"],["TK","Tokelau"],["TO","Tonga"],["TT","Trinidad and Tobago"],["TN","Tunisia"],["TR","Turkey"],["TM","Turkmenistan"],["TC","Turks and Caicos Islands"],["TV","Tuvalu"],["UG","Uganda"],["UA","Ukraine"],["AE","United Arab Emirates"],["GB","United Kingdom of Great Britain and Northern Ireland"],["UM","United States Minor Outlying Islands"],["US","United States of America"],["UY","Uruguay"],["UZ","Uzbekistan"],["VU","Vanuatu"],["VE","Venezuela (Bolivarian Republic of)"],["VN","Viet Nam"],["VG","Virgin Islands (British)"],["VI","Virgin Islands (U.S.)"],["WF","Wallis and Futuna"],["EH","Western Sahara"],["YE","Yemen"],["ZM","Zambia"],["ZW","Zimbabwe"],["AX","Aland Islands"]];
    $scope.languages = [["AB","Abkhazian"],["AA","Afar"],["AF","Afrikaans"],["AK","Akan"],["SQ","Albanian"],["AM","Amharic"],["AR","Arabic"],["AN","Aragonese"],["HY","Armenian"],["AS","Assamese"],["AV","Avaric"],["AE","Avestan"],["AY","Aymara"],["AZ","Azerbaijani"],["BM","Bambara"],["BA","Bashkir"],["EU","Basque"],["BE","Belarusian"],["BN","Bengali"],["BH","Bihari languages"],["BI","Bislama"],["BS","Bosnian"],["BR","Breton"],["BG","Bulgarian"],["MY","Burmese"],["CA","Catalan"],["KM","Central Khmer"],["CH","Chamorro"],["CE","Chechen"],["NY","Chichewa"],["ZH","Chinese"],["CU","Church Slavic"],["CV","Chuvash"],["KW","Cornish"],["CO","Corsican"],["CR","Cree"],["HR","Croatian"],["CS","Czech"],["DA","Danish"],["DV","Divehi"],["NL","Dutch"],["DZ","Dzongkha"],["EN","English"],["EO","Esperanto"],["ET","Estonian"],["EE","Ewe"],["FO","Faroese"],["FJ","Fijian"],["FI","Finnish"],["FR","French"],["FF","Fulah"],["GD","Gaelic"],["GL","Galician"],["LG","Ganda"],["KA","Georgian"],["DE","German"],["EL","Greek"],["GN","Guarani"],["GU","Gujarati"],["HT","Haitian"],["HA","Hausa"],["HE","Hebrew"],["HZ","Herero"],["HI","Hindi"],["HO","Hiri Motu"],["HU","Hungarian"],["IS","Icelandic"],["IO","Ido"],["IG","Igbo"],["ID","Indonesian"],["IA","Interlingua"],["IE","Interlingue; Occidental"],["IU","Inuktitut"],["IK","Inupiaq"],["GA","Irish"],["IT","Italian"],["JA","Japanese"],["JV","Javanese"],["KL","Kalaallisut"],["KN","Kannada"],["KR","Kanuri"],["KS","Kashmiri"],["KK","Kazakh"],["KI","Kikuyu"],["RW","Kinyarwanda"],["KY","Kirghiz"],["KV","Komi"],["KG","Kongo"],["KO","Korean"],["KJ","Kuanyama"],["KU","Kurdish"],["LO","Lao"],["LA","Latin"],["LV","Latvian"],["LI","Limburgan"],["LN","Lingala"],["LT","Lithuanian"],["LU","Luba-Katanga"],["LB","Luxembourgish"],["MK","Macedonian"],["MG","Malagasy"],["MS","Malay"],["ML","Malayalam"],["MT","Maltese"],["GV","Manx"],["MI","Maori"],["MR","Marathi"],["MH","Marshallese"],["MN","Mongolian"],["NA","Nauru"],["NV","Navajo"],["ND","Ndebele"],["NR","Ndebele"],["NG","Ndonga"],["NE","Nepali"],["SE","Northern Sami"],["NO","Norwegian"],["NB","Norwegian Bokmal"],["NN","Norwegian Nynorsk"],["OC","Occitan"],["OJ","Ojibwa"],["OR","Oriya"],["OM","Oromo"],["OS","Ossetian"],["PI","Pali"],["PA","Panjabi"],["FA","Persian"],["PL","Polish"],["PT","Portuguese"],["PS","Pushto"],["QU","Quechua"],["RO","Romanian"],["RM","Romansh"],["RN","Rundi"],["RU","Russian"],["SM","Samoan"],["SG","Sango"],["SA","Sanskrit"],["SC","Sardinian"],["SR","Serbian"],["SN","Shona"],["II","Sichuan Yi"],["SD","Sindhi"],["SI","Sinhala"],["SK","Slovak"],["SL","Slovenian"],["SO","Somali"],["ST","Sotho"],["ES","Spanish"],["SU","Sundanese"],["SW","Swahili"],["SS","Swati"],["SV","Swedish"],["TL","Tagalog"],["TY","Tahitian"],["TG","Tajik"],["TA","Tamil"],["TT","Tatar"],["TE","Telugu"],["TH","Thai"],["BO","Tibetan"],["TI","Tigrinya"],["TO","Tonga"],["TS","Tsonga"],["TN","Tswana"],["TR","Turkish"],["TK","Turkmen"],["TW","Twi"],["UG","Uighur"],["UK","Ukrainian"],["UR","Urdu"],["UZ","Uzbek"],["VE","Venda"],["VI","Vietnamese"],["VO","Volapuk"],["WA","Walloon"],["CY","Welsh"],["FY","Western Frisian"],["WO","Wolof"],["XH","Xhosa"],["YI","Yiddish"],["YO","Yoruba"],["ZA","Zhuang"],["ZU","Zulu"]];
    $scope.contract = {'txt': [''], days: 30, lang: ["EN","English"]};

    $scope.makeContract = function() {
        Encrypt.status().$promise.then(function (data) {
            if (data.result_status) {
                if (data.result != 3){
                    $scope.unlockWallet(data.result, makeContract);
                }else{
                    makeContract();
                }

            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get wallet status: ' + data.message});
            }
        });
    }

    $scope.unlockWallet = function(status, callback){
        $uibModalInstance.close();
        var modalInstance = $uibModal.open({
            templateUrl: 'lockModal.html',
            controller: 'lockWalletController',
            resolve: {
                status: function () {
                    return status;
                }
            }
        });

        modalInstance.result.then(
            function (result) {
                callback();
            }
        );
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.addTxt = function() {
        $scope.contract.txt.push('');
    }

    $scope.delTxt = function(idx) {
        $scope.contract.txt.splice(idx, 1);
    }

    Address.get().$promise.then(function (data) {
        if (data.result_status) {
            $scope.addresses = data.result;
            $scope.contract.address = $scope.addresses[0]
        } else {
            $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get addresses: ' + data.message});
        }
    });
});