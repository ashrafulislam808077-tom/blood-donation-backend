import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('register');
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('সব গ্রুপ');
  const [currentUser, setCurrentUser] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '', location: '', profilePic: '' });

  const [requestForm, setRequestForm] = useState({
    problem: '', bloodGroup: 'A+', hemoglobin: '', unitsNeeded: 1,
    donationTime: '', donationDate: '', location: '', contactPhone: '', reference: ''
  });

  const [donorForm, setDonorForm] = useState({
    name: '', email: '', password: '', bloodGroup: 'A+', phone: '', location: '',
    profilePic: '', securityQuestion: 'আপনার প্রথম স্কুলের নাম কি?', securityAnswer: ''
  });

  useEffect(() => {
    fetchDonors();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setEditProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        profilePic: currentUser.profilePic || ''
      });
    }
  }, [currentUser]);

  const fetchDonors = () => {
    fetch('http://localhost:5000/api/auth/donors')
      .then(res => res.json())
      .then(data => setDonors(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchRequests = () => {
    fetch('http://localhost:5000/api/requests')
      .then(res => res.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const compressAndConvertImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 400;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressAndConvertImage(file, (base64Img) => {
        setDonorForm(prev => ({ ...prev, profilePic: base64Img }));
      });
    }
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressAndConvertImage(file, (base64Img) => {
        setEditProfileForm(prev => ({ ...prev, profilePic: base64Img }));
      });
    }
  };

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donorForm)
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'রেজিস্ট্রেশন সফল হয়েছে!');
        fetchDonors();
        setActiveTab('login');
      } else {
        alert(data.message || 'রেজিস্ট্রেশন করতে ব্যর্থ হয়েছেন!');
      }
    } catch (error) {
      alert('সার্ভার ত্রুটি!');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          setCurrentUser(data.user);
          alert('লগইন সফল!');
          setActiveTab('myProfile');
        } else {
          alert(data.message || 'তথ্য ভুল হয়েছে');
        }
      });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/auth/profile/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfileForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert('প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
        setCurrentUser(data.user);
        fetchDonors();
      } else {
        alert(data.message || 'আপডেট করতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      alert('সার্ভার ত্রুটি!');
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert('রক্তের আবেদন সফল হয়েছে!');
        fetchRequests();
        setActiveTab('allRequests');
      } else {
        alert(data.message || 'আবেদন জমা দেওয়া যায়নি');
      }
    } catch (err) {
      alert('আবেদন পাঠাতে সমস্যা হয়েছে');
    }
  };

  const filteredDonors = selectedGroup === 'সব গ্রুপ' 
    ? donors 
    : donors.filter(d => d.bloodGroup === selectedGroup);

  return (
    <div className="main-wrapper">
      
      {/* লোগো এবং শিরোনাম সেকশন */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <img 
          src="/logo.png" 
          alt="যুবশক্তি ব্লাড ডোনেশন লোগো" 
          style={{ height: '65px', width: '65px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        <h1 className="brand-title" style={{ margin: 0 }}>🩸 যুবশক্তি ব্লাড ডোনেশন (কিশোরগঞ্জ) 🩸</h1>
      </header>

      <div className="tab-menu">
        <button className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`} onClick={() => setActiveTab('request')}>
          🩸 রক্তের আবেদন
        </button>
        <button className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
          📝 রেজিস্ট্রেশন
        </button>
        <button className={`tab-btn ${activeTab === 'findDonor' ? 'active' : ''}`} onClick={() => setActiveTab('findDonor')}>
          🔍 ডোনার খুঁজুন
        </button>
        <button className={`tab-btn ${activeTab === 'allRequests' ? 'active' : ''}`} onClick={() => setActiveTab('allRequests')}>
          📋 সকল রিকোয়েস্ট
        </button>
        <button className={`tab-btn ${activeTab === 'login' || activeTab === 'myProfile' ? 'active' : ''}`} onClick={() => setActiveTab(currentUser ? 'myProfile' : 'login')}>
          {currentUser ? `👤 প্রোফাইল` : '🔑 লগইন'}
        </button>
      </div>

      <div className="tab-content">

        {activeTab === 'request' && (
          <form onSubmit={handleRequestSubmit} className="vertical-form">
            <h2>🩸 নতুন রক্তের আবেদন</h2>
            <label>রোগীর সমস্যা:</label>
            <input type="text" placeholder="রোগীর সমস্যা" required onChange={e => setRequestForm({...requestForm, problem: e.target.value})} />
            
            <label>রক্তের গ্রুপ:</label>
            <select onChange={e => setRequestForm({...requestForm, bloodGroup: e.target.value})}>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
            </select>

            <label>হিমোগ্লোবিন:</label>
            <input type="text" placeholder="যেমন: 10 g/dL" required onChange={e => setRequestForm({...requestForm, hemoglobin: e.target.value})} />

            <label>রক্তের পরিমাণ (ব্যাগ):</label>
            <input type="number" placeholder="কত ব্যাগ" required onChange={e => setRequestForm({...requestForm, unitsNeeded: e.target.value})} />

            <label>রক্তদানের সময়:</label>
            <input type="time" required onChange={e => setRequestForm({...requestForm, donationTime: e.target.value})} />

            <label>রক্তদানের তারিখ:</label>
            <input type="date" required onChange={e => setRequestForm({...requestForm, donationDate: e.target.value})} />

            <label>রক্তদানের স্থান:</label>
            <input type="text" placeholder="হাসপাতাল / স্থান" required onChange={e => setRequestForm({...requestForm, location: e.target.value})} />

            <label>যোগাযোগ:</label>
            <input type="text" placeholder="মোবাইল নম্বর" required onChange={e => setRequestForm({...requestForm, contactPhone: e.target.value})} />

            <label>রেফারেন্স:</label>
            <input type="text" placeholder="রেফারেন্স (ঐচ্ছিক)" onChange={e => setRequestForm({...requestForm, reference: e.target.value})} />

            <button type="submit" className="submit-btn">আবেদন জমা দিন</button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleDonorSubmit} className="vertical-form">
            <h2>📝 নতুন ডোনার রেজিস্ট্রেশন</h2>
            <label>নাম:</label>
            <input type="text" placeholder="আপনার নাম" required onChange={e => setDonorForm({...donorForm, name: e.target.value})} />

            <label>ইমেইল:</label>
            <input type="email" placeholder="ইমেইল অ্যাড্রেস" required onChange={e => setDonorForm({...donorForm, email: e.target.value})} />

            <label>পাসওয়ার্ড:</label>
            <input type="password" placeholder="পাসওয়ার্ড" required onChange={e => setDonorForm({...donorForm, password: e.target.value})} />

            <label>রক্তের গ্রুপ:</label>
            <select onChange={e => setDonorForm({...donorForm, bloodGroup: e.target.value})}>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
            </select>

            <label>ফোন নম্বর:</label>
            <input type="text" placeholder="ফোন নম্বর" required onChange={e => setDonorForm({...donorForm, phone: e.target.value})} />

            <label>ঠিকানা:</label>
            <input type="text" placeholder="বর্তমান ঠিকানা" required onChange={e => setDonorForm({...donorForm, location: e.target.value})} />

            <label>প্রোফাইল ছবি পছন্দ করুন:</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} required />

            <label>সিকিউরিটি প্রশ্ন বেছে নিন:</label>
            <select value={donorForm.securityQuestion} onChange={e => setDonorForm({...donorForm, securityQuestion: e.target.value})}>
              <option value="আপনার প্রথম স্কুলের নাম কি?">আপনার প্রথম স্কুলের নাম কি?</option>
              <option value="আপনার প্রিয় রঙের নাম কি?">আপনার প্রিয় রঙের নাম কি?</option>
              <option value="আপনার শৈশবের ডাকনাম কি?">আপনার শৈশবের ডাকনাম কি?</option>
              <option value="আপনার প্রিয় পোষা প্রাণীর নাম কি?">আপনার প্রিয় পোষা প্রাণীর নাম কি?</option>
              <option value="আপনার জন্মস্থান কোথায়?">আপনার জন্মস্থান কোথায়?</option>
            </select>

            <label>সিকিউরিটি প্রশ্নের উত্তর:</label>
            <input type="text" placeholder="উত্তর দিন" required onChange={e => setDonorForm({...donorForm, securityAnswer: e.target.value})} />

            <button type="submit" className="submit-btn">রেজিস্ট্রেশন সম্পূর্ণ করুন</button>
          </form>
        )}

        {activeTab === 'findDonor' && (
          <div>
            <h2>🔍 ডোনার খুঁজুন</h2>
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="select-dropdown">
              <option value="সব গ্রুপ">সব গ্রুপ</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
            </select>
            <div className="list-grid">
              {filteredDonors.map(donor => (
                <div key={donor._id} className="item-card flex-card">
                  <img src={donor.profilePic || 'https://via.placeholder.com/80'} alt="Donor" className="card-avatar" />
                  <div>
                    <h3>{donor.name} (<span className="red-text">{donor.bloodGroup}</span>)</h3>
                    <p>📍 {donor.location}</p>
                    <p>📞 {donor.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'allRequests' && (
          <div>
            <h2>📋 সকল রক্তের আবেদন</h2>
            <div className="list-grid">
              {requests.map(req => (
                <div key={req._id} className="item-card">
                  <h3>গ্রুপ: <span className="red-text">{req.bloodGroup}</span></h3>
                  <p><strong>রোগীর সমস্যা:</strong> {req.problem}</p>
                  <p><strong>হিমোগ্লোবিন:</strong> {req.hemoglobin}</p>
                  <p><strong>পরিমাণ:</strong> {req.unitsNeeded} ব্যাগ</p>
                  <p><strong>তারিখ ও সময়:</strong> {req.donationDate} ({req.donationTime})</p>
                  <p><strong>স্থান:</strong> {req.location}</p>
                  <p><strong>যোগাযোগ:</strong> {req.contactPhone}</p>
                  <p><strong>রেফারেন্স:</strong> {req.reference || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'login' && !currentUser && (
          <form onSubmit={handleLogin} className="vertical-form">
            <h2>🔑 ডোনার লগইন</h2>
            <label>ইমেইল:</label>
            <input type="email" required onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
            <label>পাসওয়ার্ড:</label>
            <input type="password" required onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
            <button type="submit" className="submit-btn">লগইন</button>
          </form>
        )}

        {activeTab === 'myProfile' && currentUser && (
          <div>
            <div className="profile-header">
              <img src={currentUser.profilePic || 'https://via.placeholder.com/100'} alt="Profile" className="profile-img-preview" />
              <h3>{currentUser.name}</h3>
              <p>রক্তের গ্রুপ: <strong className="red-text">{currentUser.bloodGroup}</strong></p>
              <p>ইমেইল: {currentUser.email}</p>
              <button className="submit-btn logout-btn" onClick={() => { setCurrentUser(null); setActiveTab('login'); }}>লগআউট</button>
            </div>
            
            <hr className="divider" />

            <form onSubmit={handleProfileUpdate} className="vertical-form">
              <h3>তথ্য আপডেট করুন:</h3>
              <label>নাম:</label>
              <input type="text" value={editProfileForm.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} required />

              <label>ফোন নম্বর:</label>
              <input type="text" value={editProfileForm.phone} onChange={e => setEditProfileForm({...editProfileForm, phone: e.target.value})} required />

              <label>ঠিকানা:</label>
              <input type="text" value={editProfileForm.location} onChange={e => setEditProfileForm({...editProfileForm, location: e.target.value})} required />

              <label>নতুন ছবি আপলোড:</label>
              <input type="file" accept="image/*" onChange={handleEditImageUpload} />

              <button type="submit" className="submit-btn update-btn">আপডেট সেভ করুন</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;