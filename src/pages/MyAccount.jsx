import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, Plus, Edit2, Trash2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addressAPI, paymentAPI } from '../services/api';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';

// US States for dropdown
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' },
];

const MyAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [savedCard, setSavedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Address modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    is_default: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [addressRes, cardRes] = await Promise.all([
        addressAPI.getAll(),
        paymentAPI.get()
      ]);
      setAddresses(addressRes.data.addresses || []);
      if (cardRes.data.has_saved_card) {
        setSavedCard(cardRes.data.card);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Address handlers
  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddressForm({
      full_name: user?.name || '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'USA',
      is_default: addresses.length === 0
    });
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (address) => {
    setEditingAddress(address);
    setAddressForm({
      full_name: address.full_name || '',
      phone: address.phone || '',
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country || 'USA',
      is_default: address.is_default || false
    });
    setAddressModalOpen(true);
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAddress = async () => {
    if (!addressForm.full_name || !addressForm.address1 || !addressForm.city || !addressForm.state || !addressForm.postal_code) {
      alert('Please fill in all required fields');
      return;
    }

    setSavingAddress(true);
    try {
      if (editingAddress) {
        await addressAPI.update(editingAddress.id, addressForm);
      } else {
        await addressAPI.add(addressForm);
      }
      await fetchData();
      setAddressModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    try {
      await addressAPI.delete(addressId);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await addressAPI.setDefault(addressId);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to set default address');
    }
  };

  const handleDeleteCard = async () => {
    if (!window.confirm('Are you sure you want to delete your saved card?')) {
      return;
    }
    try {
      await paymentAPI.delete();
      setSavedCard(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete card');
    }
  };

  // Extract last 4 digits from masked number
  const getLastFour = (maskedNumber) => {
    if (!maskedNumber) return '';
    const parts = maskedNumber.split(' ');
    return parts[parts.length - 1];
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        {/* User Info Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="text-accent" size={24} />
            <h2 className="text-xl font-serif">My Orders</h2>
          </div>
          <Button variant="accent" onClick={() => navigate('/orders')}>
            View Order History
          </Button>
        </div>

        {/* Addresses Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-accent" size={24} />
              <h2 className="text-xl font-serif">Saved Addresses</h2>
            </div>
            <Button variant="outline" onClick={openAddAddressModal}>
              <Plus size={16} className="mr-2" />
              Add New
            </Button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No saved addresses</p>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div 
                  key={address.id} 
                  className={`border rounded-lg p-4 ${address.is_default ? 'border-accent bg-accent/5' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{address.full_name}</p>
                        {address.is_default && (
                          <span className="bg-accent text-white text-xs px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      {address.phone && (
                        <p className="text-sm text-gray-600">{address.phone}</p>
                      )}
                      <p className="text-sm text-gray-600">{address.address1}</p>
                      {address.address2 && (
                        <p className="text-sm text-gray-600">{address.address2}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="p-2 text-gray-500 hover:text-accent transition-colors"
                          title="Set as default"
                        >
                          <Star size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => openEditAddressModal(address)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-accent" size={24} />
            <h2 className="text-xl font-serif">Saved Payment Method</h2>
          </div>

          {savedCard ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {savedCard.card_type || 'Card'} ending in {getLastFour(savedCard.masked_number)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {savedCard.masked_number}
                  </p>
                  {savedCard.saved_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Saved on {new Date(savedCard.saved_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleDeleteCard}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No saved payment method. Add a card during checkout.
            </p>
          )}
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={addressForm.full_name}
              onChange={handleAddressFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={addressForm.phone}
              onChange={handleAddressFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="address1"
              value={addressForm.address1}
              onChange={handleAddressFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              name="address2"
              value={addressForm.address2}
              onChange={handleAddressFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={addressForm.city}
                onChange={handleAddressFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <select
                name="state"
                value={addressForm.state}
                onChange={handleAddressFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
                required
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                name="postal_code"
                value={addressForm.postal_code}
                onChange={handleAddressFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={addressForm.country}
                onChange={handleAddressFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={addressForm.is_default}
              onChange={handleAddressFormChange}
              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700">
              Set as default shipping address
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="accent" 
              onClick={handleSaveAddress} 
              disabled={savingAddress}
              className="flex-1"
            >
              {savingAddress ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyAccount;