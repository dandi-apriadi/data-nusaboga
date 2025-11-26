import React, { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  MdClose, 
  MdFileDownload,
  MdFilterList,
  MdBarChart,
  MdPieChart,
  MdShowChart,
  MdTableChart,
  MdInsights,
  MdDateRange,
  MdCategory,
  MdAttachMoney,
  MdShoppingCart,
  MdPeople,
  MdInventory,
  MdSettings,
  MdRefresh,
  MdZoomIn,
  MdFullscreen,
  MdPrint,
  MdEmail,
  MdCalendarToday,
  MdTrendingUp,
  MdTrendingDown,
  MdMoreVert,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdInfo
} from "react-icons/md";

// Base Modal Component
const Modal = ({ isOpen, onClose, children, size = "lg" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl"
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 max-h-[90vh] overflow-hidden`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Export Configuration Modal
export const ExportConfigModal = ({ isOpen, onClose, reportType = 'sales' }) => {
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    dateRange: 'thisMonth',
    customStartDate: '',
    customEndDate: '',
    includeCharts: true,
    includeDetails: true,
    columns: [],
    emailSend: false,
    emailRecipient: ''
  });

  const [isExporting, setIsExporting] = useState(false);

  const formatOptions = [
    { value: 'csv', label: 'CSV (Excel)', icon: MdTableChart, description: 'Format tabel untuk analisis data' },
    { value: 'pdf', label: 'PDF Report', icon: MdFileDownload, description: 'Laporan lengkap dengan grafik' },
    { value: 'excel', label: 'Excel Workbook', icon: MdTableChart, description: 'File Excel dengan multiple sheet' }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'yesterday', label: 'Kemarin' },
    { value: 'thisWeek', label: 'Minggu Ini' },
    { value: 'lastWeek', label: 'Minggu Lalu' },
    { value: 'thisMonth', label: 'Bulan Ini' },
    { value: 'lastMonth', label: 'Bulan Lalu' },
    { value: 'thisQuarter', label: 'Kuartal Ini' },
    { value: 'thisYear', label: 'Tahun Ini' },
    { value: 'custom', label: 'Kustom' }
  ];

  const columnOptions = {
    sales: [
      { value: 'orderDate', label: 'Tanggal Pesanan', selected: true },
      { value: 'orderNumber', label: 'Nomor Pesanan', selected: true },
      { value: 'customerName', label: 'Nama Pelanggan', selected: true },
      { value: 'productName', label: 'Nama Produk', selected: true },
      { value: 'quantity', label: 'Jumlah', selected: true },
      { value: 'unitPrice', label: 'Harga Satuan', selected: true },
      { value: 'totalAmount', label: 'Total', selected: true },
      { value: 'paymentMethod', label: 'Metode Pembayaran', selected: false },
      { value: 'orderStatus', label: 'Status Pesanan', selected: false }
    ],
    products: [
      { value: 'productName', label: 'Nama Produk', selected: true },
      { value: 'category', label: 'Kategori', selected: true },
      { value: 'stock', label: 'Stok', selected: true },
      { value: 'price', label: 'Harga', selected: true },
      { value: 'soldCount', label: 'Terjual', selected: true },
      { value: 'revenue', label: 'Revenue', selected: false }
    ]
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would make the actual API call to generate the report
    console.log('Exporting with config:', exportConfig);
    
    setIsExporting(false);
    onClose();
  };

  const toggleColumn = (columnValue) => {
    setExportConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(columnValue)
        ? prev.columns.filter(col => col !== columnValue)
        : [...prev.columns, columnValue]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <MdFileDownload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Ekspor Laporan</h2>
              <p className="text-blue-100">Konfigurasi dan unduh laporan {reportType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6 space-y-6">
        {/* Format Selection */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Format Ekspor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formatOptions.map((format) => (
              <button
                key={format.value}
                onClick={() => setExportConfig(prev => ({ ...prev, format: format.value }))}
                className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                  exportConfig.format === format.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <format.icon className={`w-6 h-6 ${
                    exportConfig.format === format.value ? 'text-blue-600' : 'text-slate-600'
                  }`} />
                  <span className={`font-medium ${
                    exportConfig.format === format.value ? 'text-blue-800' : 'text-slate-800'
                  }`}>
                    {format.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{format.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Rentang Waktu</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {dateRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setExportConfig(prev => ({ ...prev, dateRange: option.value }))}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  exportConfig.dateRange === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {exportConfig.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={exportConfig.customStartDate}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, customStartDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={exportConfig.customEndDate}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, customEndDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Column Selection */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Kolom Data</h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {columnOptions[reportType]?.map((column) => (
                <label key={column.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={column.selected || exportConfig.columns.includes(column.value)}
                    onChange={() => toggleColumn(column.value)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Opsi Tambahan</h3>
          <div className="space-y-4">
            {exportConfig.format === 'pdf' && (
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportConfig.includeCharts}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Sertakan grafik dan chart</span>
              </label>
            )}

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exportConfig.includeDetails}
                onChange={(e) => setExportConfig(prev => ({ ...prev, includeDetails: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Sertakan detail lengkap</span>
            </label>

            <div className="border-t border-slate-200 pt-4">
              <label className="flex items-center space-x-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={exportConfig.emailSend}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, emailSend: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Kirim melalui email</span>
              </label>

              {exportConfig.emailSend && (
                <input
                  type="email"
                  placeholder="Email penerima"
                  value={exportConfig.emailRecipient}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, emailRecipient: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Ringkasan Ekspor</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Format: {formatOptions.find(f => f.value === exportConfig.format)?.label}</p>
            <p>• Periode: {dateRangeOptions.find(d => d.value === exportConfig.dateRange)?.label}</p>
            <p>• Estimasi ukuran: ~2.5 MB</p>
            {exportConfig.emailSend && <p>• Akan dikirim ke: {exportConfig.emailRecipient}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengekspor...
              </>
            ) : (
              <>
                <MdFileDownload className="w-4 h-4 mr-2" />
                Ekspor Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Advanced Filter Modal
export const FilterModal = ({ isOpen, onClose, currentFilters, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    dateRange: 'thisMonth',
    customStartDate: '',
    customEndDate: '',
    categories: [],
    paymentMethods: [],
    orderStatus: [],
    minAmount: '',
    maxAmount: '',
    customerType: '',
    productTags: [],
    sortBy: 'date',
    sortOrder: 'desc',
    ...currentFilters
  });

  const categoryOptions = [
    { value: 'abon', label: 'Abon Cakalang' },
    { value: 'dendeng', label: 'Dendeng Cakalang' },
    { value: 'fufu', label: 'Cakalang Fufu' },
    { value: 'sambal', label: 'Sambal Rica' },
    { value: 'keripik', label: 'Keripik Cakalang' }
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Tunai' },
    { value: 'transfer', label: 'Transfer Bank' },
    { value: 'ewallet', label: 'E-Wallet' },
    { value: 'credit_card', label: 'Kartu Kredit' }
  ];

  const statusOptions = [
    { value: 'MENUNGGU', label: 'Menunggu', color: 'text-amber-600' },
    { value: 'DIPROSES', label: 'Diproses', color: 'text-blue-600' },
    { value: 'DIKIRIM', label: 'Dikirim', color: 'text-purple-600' },
    { value: 'SELESAI', label: 'Selesai', color: 'text-green-600' },
    { value: 'DIBATALKAN', label: 'Dibatalkan', color: 'text-red-600' }
  ];

  const customerTypeOptions = [
    { value: 'new', label: 'Pelanggan Baru' },
    { value: 'returning', label: 'Pelanggan Kembali' },
    { value: 'vip', label: 'Pelanggan VIP' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Tanggal' },
    { value: 'amount', label: 'Jumlah' },
    { value: 'customer', label: 'Nama Pelanggan' },
    { value: 'status', label: 'Status' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      dateRange: 'thisMonth',
      customStartDate: '',
      customEndDate: '',
      categories: [],
      paymentMethods: [],
      orderStatus: [],
      minAmount: '',
      maxAmount: '',
      customerType: '',
      productTags: [],
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.paymentMethods.length > 0) count++;
    if (filters.orderStatus.length > 0) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.customerType) count++;
    if (filters.dateRange !== 'thisMonth') count++;
    return count;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <MdFilterList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Filter Lanjutan</h2>
              <p className="text-purple-100">
                {getActiveFiltersCount()} filter aktif
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6 space-y-6">
        {/* Date Range */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Rentang Waktu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {['today', 'thisWeek', 'thisMonth', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => handleFilterChange('dateRange', range)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  filters.dateRange === range
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {range === 'today' ? 'Hari Ini' : 
                 range === 'thisWeek' ? 'Minggu Ini' :
                 range === 'thisMonth' ? 'Bulan Ini' : 'Kustom'}
              </button>
            ))}
          </div>

          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dari</label>
                <input
                  type="date"
                  value={filters.customStartDate}
                  onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sampai</label>
                <input
                  type="date"
                  value={filters.customEndDate}
                  onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Kategori Produk</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryOptions.map((category) => (
              <label key={category.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.value)}
                  onChange={() => handleMultiSelectChange('categories', category.value)}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-slate-700">{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Metode Pembayaran</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {paymentMethodOptions.map((method) => (
              <label key={method.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.paymentMethods.includes(method.value)}
                  onChange={() => handleMultiSelectChange('paymentMethods', method.value)}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-slate-700">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Status Pesanan</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {statusOptions.map((status) => (
              <label key={status.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.orderStatus.includes(status.value)}
                  onChange={() => handleMultiSelectChange('orderStatus', status.value)}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <span className={`text-sm ${status.color}`}>{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amount Range */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Rentang Nilai</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Minimal</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Maksimal</label>
              <input
                type="number"
                placeholder="Tidak terbatas"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Customer Type */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tipe Pelanggan</h3>
          <select
            value={filters.customerType}
            onChange={(e) => handleFilterChange('customerType', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Semua Pelanggan</option>
            {customerTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Sorting */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Pengurutan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Urutkan berdasarkan</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Urutan</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="desc">Terbaru ke Terlama</option>
                <option value="asc">Terlama ke Terbaru</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <MdRefresh className="w-4 h-4 mr-2" />
            Reset
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleApplyFilters}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
            >
              <MdFilterList className="w-4 h-4 mr-2" />
              Terapkan Filter ({getActiveFiltersCount()})
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Chart Detail Modal
export const ChartDetailModal = ({ isOpen, onClose, chartData, chartType = 'sales' }) => {
  const [selectedView, setSelectedView] = useState('chart');
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  if (!chartData) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Mock detailed chart data
  const detailData = {
    sales: {
      title: 'Analisis Penjualan Detail',
      icon: MdShowChart,
      color: 'from-green-600 to-emerald-600',
      daily: [
        { date: '2024-01-01', value: 2500000, orders: 12, customers: 8 },
        { date: '2024-01-02', value: 3200000, orders: 15, customers: 11 },
        { date: '2024-01-03', value: 2800000, orders: 13, customers: 9 },
        { date: '2024-01-04', value: 4100000, orders: 18, customers: 14 },
        { date: '2024-01-05', value: 3600000, orders: 16, customers: 12 }
      ],
      insights: [
        'Penjualan tertinggi pada hari Kamis (Rp 4.1 juta)',
        'Rata-rata 14.8 pesanan per hari',
        'Trend positif dengan peningkatan 8.2%'
      ]
    },
    products: {
      title: 'Performa Produk Detail',
      icon: MdInventory,
      color: 'from-blue-600 to-indigo-600',
      data: [
        { name: 'Abon Cakalang Premium', sold: 45, revenue: 2250000, percentage: 35 },
        { name: 'Dendeng Cakalang Pedas', sold: 32, revenue: 1600000, percentage: 25 },
        { name: 'Cakalang Fufu Original', sold: 28, revenue: 1400000, percentage: 22 },
        { name: 'Sambal Rica Cakalang', sold: 15, revenue: 750000, percentage: 12 },
        { name: 'Keripik Cakalang', sold: 8, revenue: 400000, percentage: 6 }
      ],
      insights: [
        'Abon Cakalang Premium menjadi bestseller (35% total penjualan)',
        'Produk sambal memiliki potensi untuk ditingkatkan',
        '5 produk top berkontribusi 100% dari total revenue'
      ]
    }
  };

  const currentData = detailData[chartType] || detailData.sales;

  const viewOptions = [
    { value: 'chart', label: 'Grafik', icon: MdBarChart },
    { value: 'table', label: 'Tabel', icon: MdTableChart },
    { value: 'insights', label: 'Insights', icon: MdInsights }
  ];

  const periodOptions = [
    { value: 'daily', label: 'Harian' },
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className={`bg-gradient-to-r ${currentData.color} px-6 py-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <currentData.icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{currentData.title}</h2>
              <p className="text-white/80">Visualisasi dan analisis mendalam</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              <MdFileDownload className="w-4 h-4 mr-1" />
              Unduh
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
        {/* Controls */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              {viewOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedView(option.value)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedView === option.value
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.label}
                </button>
              ))}
            </div>

            {chartType === 'sales' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Periode:</span>
                {periodOptions.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === period.value
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedView === 'chart' && (
            <div className="space-y-6">
              {/* Chart Placeholder */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 h-96 flex items-center justify-center">
                <div className="text-center">
                  <MdBarChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">Grafik Detail</h3>
                  <p className="text-slate-500">Implementasi chart library (Chart.js/Recharts) di sini</p>
                </div>
              </div>

              {/* Quick Stats */}
              {chartType === 'sales' && selectedPeriod === 'daily' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Total Revenue</p>
                        <p className="text-xl font-bold text-slate-800">
                          {formatCurrency(currentData.daily.reduce((sum, item) => sum + item.value, 0))}
                        </p>
                      </div>
                      <MdAttachMoney className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Total Pesanan</p>
                        <p className="text-xl font-bold text-slate-800">
                          {currentData.daily.reduce((sum, item) => sum + item.orders, 0)}
                        </p>
                      </div>
                      <MdShoppingCart className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Pelanggan Unik</p>
                        <p className="text-xl font-bold text-slate-800">
                          {currentData.daily.reduce((sum, item) => sum + item.customers, 0)}
                        </p>
                      </div>
                      <MdPeople className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Rata-rata/Hari</p>
                        <p className="text-xl font-bold text-slate-800">
                          {formatCurrency(currentData.daily.reduce((sum, item) => sum + item.value, 0) / currentData.daily.length)}
                        </p>
                      </div>
                      <MdTrendingUp className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedView === 'table' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {chartType === 'sales' ? (
                        <>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Tanggal</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Revenue</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Pesanan</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Pelanggan</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Avg/Order</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Produk</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Terjual</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Revenue</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Persentase</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {chartType === 'sales' ? (
                      currentData.daily.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-800">
                            {format(new Date(item.date), 'dd MMM yyyy', { locale: id })}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-800">
                            {formatCurrency(item.value)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{item.orders}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{item.customers}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatCurrency(item.value / item.orders)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      currentData.data.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{item.sold}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-800">
                            {formatCurrency(item.revenue)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-slate-600">{item.percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedView === 'insights' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Key Insights</h3>
                <div className="space-y-3">
                  {currentData.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <MdInsights className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Rekomendasi</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <MdCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800">Tingkatkan Stok Bestseller</p>
                      <p className="text-sm text-green-700">Focus pada produk dengan performa terbaik untuk maksimalkan profit</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <MdWarning className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">Evaluasi Produk Underperform</p>
                      <p className="text-sm text-amber-700">Lakukan review terhadap produk dengan penjualan rendah</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <MdInfo className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-800">Optimasi Hari Penjualan</p>
                      <p className="text-sm text-blue-700">Manfaatkan momentum hari-hari dengan penjualan tinggi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};