tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            serif: ['Cinzel', 'serif'],
          },
          colors: {
            gold: {
              300: '#fde047',
              400: '#facc15',
              500: '#eab308',
              600: '#ca8a04',
            },
            expedition: {
              dark: '#0B132B',
              navy: '#1C2541',
              accent: '#3A506B',
              cyan: '#5BC0BE',
              gold: '#D4AF37',
            }
          }
        }
      }
    }

document.addEventListener('DOMContentLoaded', () => {

      // DOM Elements
      const form = document.getElementById('expedition-form');
      const fullNameInput = document.getElementById('fullName');
      const cpfInput = document.getElementById('cpf');
      const birthDateInput = document.getElementById('birthDate');
      const addressInput = document.getElementById('address');
      const healthDetailsInput = document.getElementById('healthDetails');
      const healthConditionContainer = document.getElementById('healthConditionContainer');
      const acceptTermsCheckbox = document.getElementById('acceptTerms');
      const submitBtn = document.getElementById('submit-btn');

      const progressBar = document.getElementById('progress-bar');
      const progressPercentage = document.getElementById('progress-percentage');
      const progressStatusText = document.getElementById('progress-status-text');

      const alertBanner = document.getElementById('alert-banner');
      const alertIcon = document.getElementById('alert-icon');
      const alertMessage = document.getElementById('alert-message');

      const termsModal = document.getElementById('termsModal');
      const btnOpenTerms = document.getElementById('btn-open-terms');
      const btnCloseTerms = document.getElementById('btn-close-terms');
      const btnAgreeModal = document.getElementById('btn-agree-modal');

      const ticketModal = document.getElementById('ticketModal');
      const btnCloseTicket = document.getElementById('btn-close-ticket');
      const btnPrintTicket = document.getElementById('btn-print-ticket');
      const btnNewRegistration = document.getElementById('btn-new-registration');

      // State tracker
      const fieldsValid = {
        fullName: false,
        cpf: false,
        birthDate: false,
        address: false,
        hasHealthCondition: false,
        healthDetails: true, // Defaults to true if "NÃ£o"
        acceptTerms: false
      };

      // --- OFFICIAL CPF CHECKSUM ALGORITHM (MODULO 11) ---
      function isValidCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11) return false;
        
        // Eliminate known invalid repetition patterns
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let add = 0;
        for (let i = 0; i < 9; i++) {
          add += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9))) return false;

        add = 0;
        for (let i = 0; i < 10; i++) {
          add += parseInt(cpf.charAt(i)) * (11 - i);
        }
        rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(10))) return false;

        return true;
      }

      // Format CPF Mask live (000.000.000-00)
      function maskCPF(value) {
        let v = value.replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return v;
      }

      // Real-time Field UI Updater
      function setFieldStatus(fieldId, isValid, errorMessage = '') {
        const inputElem = document.getElementById(fieldId);
        const errorElem = document.getElementById(`error-${fieldId}`);
        const iconElem = document.getElementById(`icon-${fieldId}`);

        fieldsValid[fieldId] = isValid;

        if (inputElem) {
          if (isValid) {
            inputElem.classList.remove('border-rose-500', 'border-slate-700/80');
            inputElem.classList.add('border-emerald-500');
          } else {
            inputElem.classList.remove('border-emerald-500', 'border-slate-700/80');
            inputElem.classList.add('border-rose-500');
          }
        }

        if (iconElem) {
          iconElem.classList.remove('opacity-0', 'fa-circle-check', 'text-emerald-400', 'fa-circle-exclamation', 'text-rose-400');
          if (isValid) {
            iconElem.classList.add('opacity-100', 'fa-circle-check', 'text-emerald-400');
          } else {
            iconElem.classList.add('opacity-100', 'fa-circle-exclamation', 'text-rose-400');
          }
        }

        if (errorElem) {
          if (isValid) {
            errorElem.classList.add('hidden');
            errorElem.innerHTML = '';
          } else {
            errorElem.classList.remove('hidden');
            errorElem.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMessage}`;
          }
        }

        updateProgress();
      }

      // Update Progress Bar
      function updateProgress() {
        const total = Object.keys(fieldsValid).length;
        let validCount = 0;
        for (let key in fieldsValid) {
          if (fieldsValid[key]) validCount++;
        }

        const percentage = Math.round((validCount / total) * 100);
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}% concluÃ­do`;

        if (percentage === 100) {
          progressStatusText.className = "text-emerald-400 font-bold flex items-center gap-1.5";
          progressStatusText.innerHTML = '<i class="fa-solid fa-circle-check"></i> Pronto para emissÃ£o!';
        } else {
          progressStatusText.className = "text-amber-400 font-bold flex items-center gap-1.5";
          progressStatusText.innerHTML = '<i class="fa-solid fa-pen-ruler"></i> Preenchendo dados...';
        }
      }

      // Display Top Alert
      function showAlert(type, message) {
        alertBanner.classList.remove('hidden', 'bg-rose-500/10', 'border-rose-500/30', 'text-rose-300', 'bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-300');
        alertIcon.classList.remove('fa-triangle-exclamation', 'text-rose-400', 'fa-circle-check', 'text-emerald-400');

        if (type === 'error') {
          alertBanner.classList.add('bg-rose-500/10', 'border-rose-500/30', 'text-rose-300');
          alertIcon.classList.add('fa-triangle-exclamation', 'text-rose-400');
        } else {
          alertBanner.classList.add('bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-300');
          alertIcon.classList.add('fa-circle-check', 'text-emerald-400');
        }

        alertMessage.textContent = message;
        alertBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      function hideAlert() {
        alertBanner.classList.add('hidden');
      }

      // --- INDIVIDUAL FIELD VALIDATORS ---

      // Full Name Validation
      function validateFullName() {
        const val = fullNameInput.value.trim();
        const nameParts = val.split(/\s+/).filter(part => part.length > 0);

        if (val === '') {
          setFieldStatus('fullName', false, 'O nome completo Ã© obrigatÃ³rio.');
          return false;
        }
        if (nameParts.length < 2) {
          setFieldStatus('fullName', false, 'Por favor, insira sobrenome tambÃ©m.');
          return false;
        }
        if (val.length < 5) {
          setFieldStatus('fullName', false, 'O nome deve ter pelo menos 5 caracteres.');
          return false;
        }

        setFieldStatus('fullName', true);
        return true;
      }

      // CPF Validation
      function validateCPF() {
        const val = cpfInput.value.trim();
        if (val === '') {
          setFieldStatus('cpf', false, 'O CPF Ã© obrigatÃ³rio.');
          return false;
        }
        if (!isValidCPF(val)) {
          setFieldStatus('cpf', false, 'CPF invÃ¡lido. Verifique os nÃºmeros digitados.');
          return false;
        }

        setFieldStatus('cpf', true);
        return true;
      }

      // Birth Date Validation
      function validateBirthDate() {
        const val = birthDateInput.value;
        if (!val) {
          setFieldStatus('birthDate', false, 'A data de nascimento Ã© obrigatÃ³ria.');
          return false;
        }

        const birthDate = new Date(val);
        const today = new Date();
        
        if (birthDate >= today) {
          setFieldStatus('birthDate', false, 'A data deve ser no passado.');
          return false;
        }

        // Calculate Age
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 18) {
          setFieldStatus('birthDate', false, 'Ã‰ necessÃ¡rio ter pelo menos 18 anos para se cadastrar.');
          return false;
        }
        if (age > 110) {
          setFieldStatus('birthDate', false, 'Por favor, informe uma data vÃ¡lida.');
          return false;
        }

        setFieldStatus('birthDate', true);
        return true;
      }

      // Address Validation
      function validateAddress() {
        const val = addressInput.value.trim();
        if (val === '') {
          setFieldStatus('address', false, 'O endereÃ§o completo Ã© obrigatÃ³rio.');
          return false;
        }
        if (val.length < 10) {
          setFieldStatus('address', false, 'Insira um endereÃ§o mais detalhado (mÃ­nimo 10 caracteres).');
          return false;
        }

        setFieldStatus('address', true);
        return true;
      }

      // Health Radio Validation
      function validateHealthRadio() {
        const selectedRadio = document.querySelector('input[name="hasHealthCondition"]:checked');
        const errorElem = document.getElementById('error-hasHealthCondition');

        if (!selectedRadio) {
          fieldsValid.hasHealthCondition = false;
          if (errorElem) {
            errorElem.classList.remove('hidden');
            errorElem.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Por favor, selecione uma das opÃ§Ãµes de saÃºde.`;
          }
          updateProgress();
          return false;
        }

        fieldsValid.hasHealthCondition = true;
        if (errorElem) errorElem.classList.add('hidden');

        if (selectedRadio.value === 'sim') {
          healthConditionContainer.classList.remove('hidden');
          validateHealthDetails();
        } else {
          healthConditionContainer.classList.add('hidden');
          fieldsValid.healthDetails = true; // Not required
          const healthError = document.getElementById('error-healthDetails');
          if (healthError) healthError.classList.add('hidden');
        }

        updateProgress();
        return true;
      }

      // Health Details Validation
      function validateHealthDetails() {
        const selectedRadio = document.querySelector('input[name="hasHealthCondition"]:checked');
        if (!selectedRadio || selectedRadio.value !== 'sim') {
          fieldsValid.healthDetails = true;
          return true;
        }

        const val = healthDetailsInput.value.trim();
        const errorElem = document.getElementById('error-healthDetails');

        if (val === '') {
          fieldsValid.healthDetails = false;
          healthDetailsInput.classList.remove('border-emerald-500');
          healthDetailsInput.classList.add('border-rose-500');
          if (errorElem) {
            errorElem.classList.remove('hidden');
            errorElem.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Como vocÃª selecionou "Sim", descreva sua condiÃ§Ã£o mÃ©dica.`;
          }
          updateProgress();
          return false;
        }

        if (val.length < 5) {
          fieldsValid.healthDetails = false;
          healthDetailsInput.classList.remove('border-emerald-500');
          healthDetailsInput.classList.add('border-rose-500');
          if (errorElem) {
            errorElem.classList.remove('hidden');
            errorElem.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> A descriÃ§Ã£o deve conter no mÃ­nimo 5 caracteres.`;
          }
          updateProgress();
          return false;
        }

        fieldsValid.healthDetails = true;
        healthDetailsInput.classList.remove('border-rose-500');
        healthDetailsInput.classList.add('border-emerald-500');
        if (errorElem) errorElem.classList.add('hidden');

        updateProgress();
        return true;
      }

      // Terms Checkbox Validation
      function validateTerms() {
        const isChecked = acceptTermsCheckbox.checked;
        const errorElem = document.getElementById('error-acceptTerms');

        fieldsValid.acceptTerms = isChecked;

        if (!isChecked) {
          if (errorElem) {
            errorElem.classList.remove('hidden');
            errorElem.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> VocÃª deve aceitar os Termos e PolÃ­ticas para prosseguir.`;
          }
          updateProgress();
          return false;
        }

        if (errorElem) errorElem.classList.add('hidden');
        updateProgress();
        return true;
      }

      // --- EVENT LISTENERS FOR REAL-TIME MONITORING ---

      // Full Name Input
      fullNameInput.addEventListener('input', validateFullName);
      fullNameInput.addEventListener('blur', validateFullName);

      // CPF Input & Masking
      cpfInput.addEventListener('input', (e) => {
        e.target.value = maskCPF(e.target.value);
        validateCPF();
      });
      cpfInput.addEventListener('blur', validateCPF);

      // Birth Date Input
      birthDateInput.addEventListener('change', validateBirthDate);
      birthDateInput.addEventListener('blur', validateBirthDate);

      // Address Input
      addressInput.addEventListener('input', validateAddress);
      addressInput.addEventListener('blur', validateAddress);

      // Health Radio Change
      document.querySelectorAll('input[name="hasHealthCondition"]').forEach(radio => {
        radio.addEventListener('change', () => {
          hideAlert();
          validateHealthRadio();
        });
      });

      // Health Details Textarea
      healthDetailsInput.addEventListener('input', validateHealthDetails);
      healthDetailsInput.addEventListener('blur', validateHealthDetails);

      // Terms Checkbox Change
      acceptTermsCheckbox.addEventListener('change', validateTerms);

      // --- MODAL CONTROLS ---

      btnOpenTerms.addEventListener('click', () => {
        termsModal.classList.remove('hidden');
      });

      btnCloseTerms.addEventListener('click', () => {
        termsModal.classList.add('hidden');
      });

      btnAgreeModal.addEventListener('click', () => {
        acceptTermsCheckbox.checked = true;
        validateTerms();
        termsModal.classList.add('hidden');
      });

      btnCloseTicket.addEventListener('click', () => {
        ticketModal.classList.add('hidden');
      });

      btnPrintTicket.addEventListener('click', () => {
        window.print();
      });

      btnNewRegistration.addEventListener('click', () => {
        ticketModal.classList.add('hidden');
        form.reset();
        healthConditionContainer.classList.add('hidden');
        
        // Reset state
        Object.keys(fieldsValid).forEach(k => fieldsValid[k] = false);
        fieldsValid.healthDetails = true;

        // Reset inputs border and icons
        ['fullName', 'cpf', 'birthDate', 'address'].forEach(id => {
          const elem = document.getElementById(id);
          if (elem) elem.className = "w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all";
          const icon = document.getElementById(`icon-${id}`);
          if (icon) icon.className = "fa-solid text-xs opacity-0 transition-opacity";
          const err = document.getElementById(`error-${id}`);
          if (err) err.classList.add('hidden');
        });

        hideAlert();
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      // --- FORM SUBMISSION HANDLER ---

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Run all validations on submit attempt
        const isNameValid = validateFullName();
        const isCpfValid = validateCPF();
        const isBirthValid = validateBirthDate();
        const isAddressValid = validateAddress();
        const isHealthRadioValid = validateHealthRadio();
        const isHealthDetailsValid = validateHealthDetails();
        const isTermsValid = validateTerms();

        const allValid = isNameValid && isCpfValid && isBirthValid && isAddressValid && 
                         isHealthRadioValid && isHealthDetailsValid && isTermsValid;

        if (!allValid) {
          showAlert('error', 'Por favor, corrija os erros destacadas no formulÃ¡rio antes de enviar.');
          return;
        }

        // Hide errors banner
        hideAlert();

        // Generate Ticket Details
        document.getElementById('ticket-name').textContent = fullNameInput.value.trim();
        document.getElementById('ticket-cpf').textContent = cpfInput.value.trim();
        
        // Format Birth Date BR Format
        const birthDateObj = new Date(birthDateInput.value + 'T00:00:00');
        document.getElementById('ticket-birth').textContent = birthDateObj.toLocaleDateString('pt-BR');
        
        document.getElementById('ticket-address').textContent = addressInput.value.trim();

        // Ticket Random Code
        const randomCode = 'EUR-2026-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        document.getElementById('ticket-code').textContent = randomCode;

        // Medical Status Badge in Ticket
        const selectedHealthRadio = document.querySelector('input[name="hasHealthCondition"]:checked');
        const ticketHealthBadge = document.getElementById('ticket-health-badge');
        const ticketHealthText = document.getElementById('ticket-health-text');

        if (selectedHealthRadio && selectedHealthRadio.value === 'sim') {
          ticketHealthBadge.className = "inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40";
          ticketHealthBadge.innerHTML = '<i class="fa-solid fa-notes-medical"></i> Requer AtenÃ§Ã£o MÃ©dica';
          ticketHealthText.textContent = `Obs: "${healthDetailsInput.value.trim()}"`;
          ticketHealthText.classList.remove('hidden');
        } else {
          ticketHealthBadge.className = "inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
          ticketHealthBadge.innerHTML = '<i class="fa-solid fa-shield-heart"></i> Apto sem restriÃ§Ãµes';
          ticketHealthText.classList.add('hidden');
        }

        // Display Ticket Modal
        ticketModal.classList.remove('hidden');
      });

    });