import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function FormView({
  itemId = null,
  fields = [],
  apiEndpoint = '',
  onSuccess = null,
  onCancel = null,
  title = ''
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const mode = itemId ? 'edit' : 'create';
  const displayTitle = title || (mode === 'edit' ? 'Edit Item' : 'Create New Item');

  useEffect(() => {
    if (itemId) {
      loadItemData();
    } else {
      const initialData = {};
      fields.forEach(field => {
        initialData[field.name] = field.defaultValue || '';
      });
      setFormData(initialData);
    }
  }, [itemId]);

  const loadItemData = async () => {
    setInitialLoading(true);
    try {
      const response = await api.get(`${apiEndpoint}/${itemId}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Failed to load item:', error);
      setErrors({ general: 'Failed to load data' });
    }
    setInitialLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Invalid email address';
        }
      }
      
      if (field.validate && formData[field.name]) {
        const validationError = field.validate(formData[field.name], formData);
        if (validationError) {
          newErrors[field.name] = validationError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Get tenant_id from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const submitData = { 
        ...formData,
        tenant_id: user?.tenant_id || null
      };
      
      let response;
      if (mode === 'create') {
        response = await api.post(apiEndpoint, submitData);
      } else {
        response = await api.put(`${apiEndpoint}/${itemId}`, submitData);
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ 
        general: error.response?.data?.detail || `Failed to ${mode} item` 
      });
    }
    setLoading(false);
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    
    const baseInputClass = `w-full px-4 py-3 border ${
      error ? 'border-red-300' : 'border-gray-300'
    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value}
            onChange={handleChange}
            rows={field.rows || 4}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={baseInputClass}
          />
        );
      
      case 'select':
        return (
          <select
            name={field.name}
            value={value}
            onChange={handleChange}
            disabled={field.disabled}
            className={baseInputClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
      case 'toggle':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name={field.name}
              checked={!!value}
              onChange={handleChange}
              disabled={field.disabled}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{field.checkboxLabel || 'Enable'}</span>
          </label>
        );
      
      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            className={baseInputClass}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            name={field.name}
            value={value}
            onChange={handleChange}
            disabled={field.disabled}
            className={baseInputClass}
          />
        );
      
      case 'password':
        return (
          <input
            type="password"
            name={field.name}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={baseInputClass}
          />
        );
      
      default:
        return (
          <input
            type={field.type || 'text'}
            name={field.name}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={baseInputClass}
          />
        );
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{displayTitle}</h2>
      
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {renderField(field)}
            
            {field.helpText && (
              <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
            )}
            
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
            )}
          </div>
        ))}
        
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </span>
            ) : (
              mode === 'create' ? 'Create' : 'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
