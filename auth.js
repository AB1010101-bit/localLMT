/* Simple front-end password gating (NOT production secure). */
(function(){
  const PASSWORD = 'admin123'; // CHANGE THIS IMMEDIATELY IN PRODUCTION
  const AUTH_KEY = 'labAuth';
  const LOCK_KEY = 'labAuthLockedUntil';
  const MAX_ATTEMPTS = 5;
  const LOCK_MINUTES = 5;

  function now(){return Date.now();}
  function lockedUntil(){return parseInt(localStorage.getItem(LOCK_KEY)||'0',10);}  
  function attempts(){return parseInt(localStorage.getItem('labAuthAttempts')||'0',10);}  
  function setAttempts(n){localStorage.setItem('labAuthAttempts', String(n));}

  function isLocked(){
    const lu = lockedUntil();
    if(lu && lu > now()) return true;
    if(lu && lu <= now()) { localStorage.removeItem(LOCK_KEY); setAttempts(0);} 
    return false;
  }

  function lock(){
    localStorage.setItem(LOCK_KEY, String(now() + LOCK_MINUTES*60*1000));
  }

  function authSuccess(){
    sessionStorage.setItem(AUTH_KEY, '1');
    setAttempts(0);
    window.location.href = 'index.html';
  }

  function authFailure(){
    const a = attempts()+1;
    setAttempts(a);
    if(a >= MAX_ATTEMPTS){
      lock();
      showError(`Too many attempts. Locked for ${LOCK_MINUTES} minutes.`);
    } else {
      showError(`Incorrect password. Attempts left: ${MAX_ATTEMPTS - a}`);
    }
  }

  function showError(msg){
    const box = document.getElementById('authError');
    if(box){box.textContent = msg; box.style.display='block';}
  }

  function initLogin(){
    const form = document.getElementById('loginForm');
    if(!form) return;
    if(sessionStorage.getItem(AUTH_KEY)){window.location.href='index.html'; return;}
    if(isLocked()){showError('Locked due to too many attempts. Try later.'); return;}
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(isLocked()){showError('Locked. Try later.'); return;}
      const input = document.getElementById('passwordInput');
      const val = (input.value||'').trim();
      if(!val){showError('Password required.'); return;}
      if(val === PASSWORD){authSuccess();}
      else {authFailure();}
    });
  }

  function gateIndex(){
    if(!sessionStorage.getItem(AUTH_KEY)){
      // Use replace to avoid back button revealing content
      window.location.replace('login.html');
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(document.body && document.body.dataset.page === 'login'){initLogin();}
    else {gateIndex();}
  });
})();
