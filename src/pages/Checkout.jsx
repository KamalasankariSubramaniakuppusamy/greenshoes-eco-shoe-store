import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { checkoutAPI, addressAPI, paymentAPI, cartAPI } from '../services/api';
import { formatCurrency, validateCardNumber, formatCardNumber, formatExpiry } from '../utils/constants';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

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

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}${imagePath}`;
};

// Helper to extract last 4 digits from masked number
const getLastFour = (maskedNumber) => {
  if (!maskedNumber) return '';
  const parts = maskedNumber.split(' ');
  return parts[parts.length - 1];
};

const Checkout = () => {
  const { isAuthenticated, user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this is a Buy Now flow
  const buyNowProduct = location.state?.buyNow ? location.state.product : null;

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [savedCard, setSavedCard] = useState(null);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [useExistingCard, setUseExistingCard] = useState(false);
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [error, setError] = useState('');

  // New address modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [cardError, setCardError] = useState('');
  const [newAddressForm, setNewAddressForm] = useState({
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

  const [formData, setFormData] = useState({
    // Shipping
    shipping_full_name: '',
    shipping_phone: '',
    shipping_address1: '',
    shipping_address2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'USA',
    // Billing (optional)
    billing_address_id: '',
    // Payment
    card_number: '',
    expiry: '',
    cvc: '',
    // Address selection
    shipping_address_id: '',
  });

  useEffect(() => {
    // Don't redirect if this is a Buy Now flow
    if (!buyNowProduct && (!cart.items || cart.items.length === 0)) {
      navigate('/cart');
      return;
    }

    if (isAuthenticated) {
      fetchAddresses();
      fetchSavedCard();
    }
  }, [cart, isAuthenticated, navigate, buyNowProduct]);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll();
      setAddresses(response.data.addresses || []);
      
      // Set default address if exists
      const defaultAddr = response.data.addresses?.find(a => a.is_default);
      if (defaultAddr) {
        setFormData(prev => ({
          ...prev,
          shipping_address_id: defaultAddr.id,
          shipping_full_name: defaultAddr.full_name,
          shipping_phone: defaultAddr.phone,
          shipping_address1: defaultAddr.address1,
          shipping_address2: defaultAddr.address2 || '',
          shipping_city: defaultAddr.city,
          shipping_state: defaultAddr.state,
          shipping_postal_code: defaultAddr.postal_code,
          shipping_country: defaultAddr.country,
        }));
        setUseExistingAddress(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchSavedCard = async () => {
    try {
      const response = await paymentAPI.get();
      if (response.data.has_saved_card && response.data.card) {
        setSavedCard(response.data.card);
        setUseExistingCard(true);
      }
    } catch (error) {
      console.error('Error fetching saved card:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number
    if (name === 'card_number') {
      const formatted = formatCardNumber(value);
      setFormData({ ...formData, [name]: formatted });
      
      // Clear error when user starts typing again
      if (cardError) setCardError('');
      return;
    }
    
    // Format expiry
    if (name === 'expiry') {
      setFormData({ ...formData, [name]: formatExpiry(value) });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Validate card number when user leaves the field
  const handleCardBlur = () => {
    const cardNumber = formData.card_number.replace(/\s/g, '');
    if (cardNumber.length > 0 && !validateCardNumber(cardNumber)) {
      setCardError('Invalid card number. Please check and try again.');
    } else {
      setCardError('');
    }
  };

  const handleAddressSelect = (e) => {
    const addressId = e.target.value;
    
    if (addressId === 'new') {
      // Open modal to add new address
      setNewAddressForm({
        full_name: user?.name || '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'USA',
        is_default: false
      });
      setAddressModalOpen(true);
      return;
    }
    
    const selected = addresses.find(a => a.id === addressId);
    
    if (selected) {
      setFormData({
        ...formData,
        shipping_address_id: addressId,
        shipping_full_name: selected.full_name,
        shipping_phone: selected.phone,
        shipping_address1: selected.address1,
        shipping_address2: selected.address2 || '',
        shipping_city: selected.city,
        shipping_state: selected.state,
        shipping_postal_code: selected.postal_code,
        shipping_country: selected.country,
      });
    }
  };

  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveNewAddress = async () => {
    if (!newAddressForm.full_name || !newAddressForm.address1 || !newAddressForm.city || !newAddressForm.state || !newAddressForm.postal_code) {
      alert('Please fill in all required fields');
      return;
    }

    setSavingAddress(true);
    try {
      const response = await addressAPI.add(newAddressForm);
      await fetchAddresses();
      
      // Select the newly added address
      const newAddressId = response.data.address?.id;
      if (newAddressId) {
        setFormData(prev => ({
          ...prev,
          shipping_address_id: newAddressId,
          shipping_full_name: newAddressForm.full_name,
          shipping_phone: newAddressForm.phone,
          shipping_address1: newAddressForm.address1,
          shipping_address2: newAddressForm.address2 || '',
          shipping_city: newAddressForm.city,
          shipping_state: newAddressForm.state,
          shipping_postal_code: newAddressForm.postal_code,
          shipping_country: newAddressForm.country,
        }));
      }
      
      setAddressModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields based on user state
      if (isAuthenticated) {
        if (useExistingAddress && !formData.shipping_address_id) {
          setError('Please select a shipping address');
          setLoading(false);
          return;
        }
        
        if (!useExistingAddress) {
          // Validate manual address fields
          if (!formData.shipping_full_name || !formData.shipping_phone || 
              !formData.shipping_address1 || !formData.shipping_city || 
              !formData.shipping_state || !formData.shipping_postal_code) {
            setError('Please fill in all shipping address fields');
            setLoading(false);
            return;
          }
        }

        if (useExistingCard && !formData.cvc) {
          setError('Please enter your CVC');
          setLoading(false);
          return;
        }

        if (!useExistingCard) {
          if (!formData.card_number || !formData.expiry || !formData.cvc) {
            setError('Please fill in all payment fields');
            setLoading(false);
            return;
          }
        }
      } else {
        // Guest checkout validation
        if (!formData.shipping_full_name || !formData.shipping_phone || 
            !formData.shipping_address1 || !formData.shipping_city || 
            !formData.shipping_state || !formData.shipping_postal_code) {
          setError('Please fill in all shipping address fields');
          setLoading(false);
          return;
        }

        if (!formData.card_number || !formData.expiry || !formData.cvc) {
          setError('Please fill in all payment fields');
          setLoading(false);
          return;
        }
      }

      // If this is a Buy Now flow, add the item to cart first
      if (buyNowProduct) {
        await cartAPI.add({
          productId: buyNowProduct.id,
          color: buyNowProduct.color,
          size: buyNowProduct.size,
          quantity: buyNowProduct.quantity,
        });
      }

      let response;

      if (isAuthenticated) {
        // If user entered a new address (not using saved), save it first
        let addressId = formData.shipping_address_id;
        
        if (!useExistingAddress && !addressId) {
          // Save the new address first
          try {
            const addressResponse = await addressAPI.add({
              full_name: formData.shipping_full_name,
              phone: formData.shipping_phone,
              address1: formData.shipping_address1,
              address2: formData.shipping_address2,
              city: formData.shipping_city,
              state: formData.shipping_state,
              postal_code: formData.shipping_postal_code,
              country: formData.shipping_country,
              is_default: addresses.length === 0
            });
            addressId = addressResponse.data.address?.id;
          } catch (addrError) {
            setError('Failed to save address. Please try again.');
            setLoading(false);
            return;
          }
        }

        if (!addressId) {
          setError('Please select or enter a shipping address');
          setLoading(false);
          return;
        }

        if (useExistingCard && savedCard) {
          // Checkout with saved card
          response = await checkoutAPI.savedCard({
            shipping_address_id: addressId,
            billing_address_id: formData.billing_address_id || addressId,
            cvc: formData.cvc,
          });
        } else {
          // Checkout with new card
          if (!validateCardNumber(formData.card_number.replace(/\s/g, ''))) {
            setCardError('Invalid card number. Please check and try again.');
            setLoading(false);
            return;
          }

          response = await checkoutAPI.newCard({
            shipping_address_id: addressId,
            billing_address_id: formData.billing_address_id || addressId,
            card_number: formData.card_number.replace(/\s/g, ''),
            expiry: formData.expiry,
            cvc: formData.cvc,
            save_card: saveNewCard,
          });
        }
      } else {
        // Guest checkout
        if (!validateCardNumber(formData.card_number.replace(/\s/g, ''))) {
          setCardError('Invalid card number. Please check and try again.');
          setLoading(false);
          return;
        }

        response = await checkoutAPI.guest({
          shipping_full_name: formData.shipping_full_name,
          shipping_phone: formData.shipping_phone,
          shipping_address1: formData.shipping_address1,
          shipping_address2: formData.shipping_address2,
          shipping_city: formData.shipping_city,
          shipping_state: formData.shipping_state,
          shipping_postal_code: formData.shipping_postal_code,
          shipping_country: formData.shipping_country,
          card_number: formData.card_number.replace(/\s/g, ''),
          expiry: formData.expiry,
          cvc: formData.cvc,
        });
      }

      // Success - redirect to success page
      // Handle different response formats (order for authenticated, order_summary for guest)
      const orderData = response.data.order || response.data.order_summary;
      navigate('/order-success', { state: { order: orderData, orderNumber: response.data.order_summary?.order_number } });
    } catch (error) {
      setError(error.response?.data?.error || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!buyNowProduct && (!cart.items || cart.items.length === 0)) {
    return null;
  }

  // Calculate items to display (either Buy Now product or cart items)
  const displayItems = buyNowProduct 
    ? [{ 
        id: 'buynow',
        product_id: buyNowProduct.id,
        name: buyNowProduct.name,
        price: buyNowProduct.price,
        color: buyNowProduct.color,
        size: buyNowProduct.size,
        quantity: buyNowProduct.quantity,
        image_url: buyNowProduct.image
      }]
    : cart.items || [];

  // Calculate totals for Buy Now or cart
  const subtotal = buyNowProduct 
    ? buyNowProduct.price * buyNowProduct.quantity
    : parseFloat(cart.summary?.subtotal || 0);
  const tax = subtotal * 0.06;
  const shipping = 11.95;
  const total = subtotal + tax + shipping;

  // Get card display text
  const cardDisplayText = savedCard 
    ? `${savedCard.card_type || 'Card'} ending in ${getLastFour(savedCard.masked_number)}`
    : '';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-serif mb-6">Shipping Address</h2>

                {isAuthenticated && addresses.length > 0 && (
                  <div className="mb-6">
                    <label className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        checked={useExistingAddress}
                        onChange={(e) => setUseExistingAddress(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Use saved address</span>
                    </label>

                    {useExistingAddress && (
                      <select
                        value={formData.shipping_address_id}
                        onChange={handleAddressSelect}
                        className="input-field"
                      >
                        {addresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.full_name} - {addr.address1}, {addr.city}
                            {addr.is_default ? ' (Default)' : ''}
                          </option>
                        ))}
                        <option value="new">+ Add New Address</option>
                      </select>
                    )}
                  </div>
                )}

                {isAuthenticated && addresses.length === 0 && (
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setNewAddressForm({
                          full_name: user?.name || '',
                          phone: '',
                          address1: '',
                          address2: '',
                          city: '',
                          state: '',
                          postal_code: '',
                          country: 'USA',
                          is_default: true
                        });
                        setAddressModalOpen(true);
                      }}
                      className="flex items-center gap-2 text-accent hover:text-accent-dark transition-colors"
                    >
                      <Plus size={16} />
                      <span>Add a shipping address</span>
                    </button>
                  </div>
                )}

                {(!isAuthenticated || !useExistingAddress) && (
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      name="shipping_full_name"
                      value={formData.shipping_full_name}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      label="Phone"
                      name="shipping_phone"
                      value={formData.shipping_phone}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      label="Address Line 1"
                      name="shipping_address1"
                      value={formData.shipping_address1}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      label="Address Line 2 (Optional)"
                      name="shipping_address2"
                      value={formData.shipping_address2}
                      onChange={handleChange}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        name="shipping_city"
                        value={formData.shipping_city}
                        onChange={handleChange}
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <select
                          name="shipping_state"
                          value={formData.shipping_state}
                          onChange={handleChange}
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
                      <Input
                        label="Postal Code"
                        name="shipping_postal_code"
                        value={formData.shipping_postal_code}
                        onChange={handleChange}
                        required
                      />

                      <Input
                        label="Country"
                        name="shipping_country"
                        value={formData.shipping_country}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {isAuthenticated && !useExistingAddress && (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Save this address
                              setNewAddressForm({
                                full_name: formData.shipping_full_name,
                                phone: formData.shipping_phone,
                                address1: formData.shipping_address1,
                                address2: formData.shipping_address2,
                                city: formData.shipping_city,
                                state: formData.shipping_state,
                                postal_code: formData.shipping_postal_code,
                                country: formData.shipping_country,
                                is_default: addresses.length === 0
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">Save this address for future orders</span>
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-serif mb-6">Payment Information</h2>

                {isAuthenticated && savedCard && (
                  <div className="mb-6">
                    <label className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        checked={useExistingCard}
                        onChange={(e) => setUseExistingCard(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Use saved {cardDisplayText}</span>
                    </label>
                    
                    {useExistingCard && (
                      <p className="text-sm text-gray-500 ml-6 mb-2">
                        {savedCard.masked_number}
                      </p>
                    )}
                  </div>
                )}

                {useExistingCard && savedCard ? (
                  <Input
                    label="CVC"
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Input
                        label="Card Number"
                        name="card_number"
                        value={formData.card_number}
                        onChange={handleChange}
                        onBlur={handleCardBlur}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                        className={cardError ? 'border-red-500' : ''}
                      />
                      {cardError && (
                        <p className="text-red-600 text-sm mt-1">{cardError}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiry (MM/YYYY)"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        placeholder="12/2027"
                        maxLength={7}
                        required
                      />

                      <Input
                        label="CVC"
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength={3}
                        required
                      />
                    </div>

                    {isAuthenticated && (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={saveNewCard}
                          onChange={(e) => setSaveNewCard(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Save card for future purchases</span>
                      </label>
                    )}
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> We only accept debit cards. Your card information is encrypted and secure.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-serif mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  {displayItems.map((item, index) => (
                    <Link 
                      key={item.cart_item_id || item.id || index} 
                      to={`/product/${item.product_id}`}
                      className="flex gap-3 hover:bg-gray-50 p-2 rounded -mx-2 transition-colors"
                    >
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.color} / {item.size} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.line_total || (item.price * item.quantity))}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{formatCurrency(shipping)}</span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  fullWidth
                  disabled={loading || cardError}
                  className="mt-6"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>

                <div className="mt-4 p-3 bg-yellow-50 rounded">
                  <p className="text-xs text-yellow-800">
                    No returns or refunds on all purchases
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Add New Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add New Address"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={newAddressForm.full_name}
              onChange={handleNewAddressChange}
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
              value={newAddressForm.phone}
              onChange={handleNewAddressChange}
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
              value={newAddressForm.address1}
              onChange={handleNewAddressChange}
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
              value={newAddressForm.address2}
              onChange={handleNewAddressChange}
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
                value={newAddressForm.city}
                onChange={handleNewAddressChange}
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
                value={newAddressForm.state}
                onChange={handleNewAddressChange}
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
                value={newAddressForm.postal_code}
                onChange={handleNewAddressChange}
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
                value={newAddressForm.country}
                onChange={handleNewAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default_new"
              name="is_default"
              checked={newAddressForm.is_default}
              onChange={handleNewAddressChange}
              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            />
            <label htmlFor="is_default_new" className="text-sm text-gray-700">
              Set as default shipping address
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="accent" 
              onClick={handleSaveNewAddress} 
              disabled={savingAddress}
              className="flex-1"
            >
              {savingAddress ? 'Saving...' : 'Add Address'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;