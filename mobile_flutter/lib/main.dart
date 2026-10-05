import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'data/models/models.dart';
import 'data/services/api_service.dart';

void main() {
  runApp(const ApexExpenseApp());
}

class ApexExpenseApp extends StatelessWidget {
  const ApexExpenseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Apex Expense AI',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.light,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF4F46E5),
          secondary: Color(0xFF059669),
          surface: Colors.white,
        ),
        cardTheme: CardThemeData(
          color: Colors.white.withValues(alpha: 0.9),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          elevation: 0,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFF8FAFC),
          elevation: 0,
          scrolledUnderElevation: 0,
          titleTextStyle: TextStyle(color: Color(0xFF0F172A), fontSize: 18, fontWeight: FontWeight.bold),
          iconTheme: IconThemeData(color: Color(0xFF0F172A)),
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: Colors.white.withValues(alpha: 0.95),
          indicatorColor: const Color(0xFF4F46E5).withValues(alpha: 0.12),
          labelTextStyle: WidgetStateProperty.resolveWith(
            (states) => TextStyle(
              fontSize: 12,
              fontWeight: states.contains(WidgetState.selected) ? FontWeight.bold : FontWeight.w500,
              color: states.contains(WidgetState.selected) ? const Color(0xFF4F46E5) : const Color(0xFF64748B),
            ),
          ),
        ),
        dialogTheme: DialogThemeData(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
        ),
        useMaterial3: true,
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const ProductsScreen(),
    const ExpensesScreen(),
    const AIChatScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard, color: Color(0xFF4F46E5)),
            label: 'Overview',
          ),
          NavigationDestination(
            icon: Icon(Icons.shopping_bag_outlined),
            selectedIcon: Icon(Icons.shopping_bag, color: Color(0xFF6366F1)),
            label: 'Products',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long, color: Color(0xFF6366F1)),
            label: 'Expenses',
          ),
          NavigationDestination(
            icon: Icon(Icons.smart_toy_outlined),
            selectedIcon: Icon(Icons.smart_toy, color: Color(0xFF6366F1)),
            label: 'AI Advisor',
          ),
        ],
      ),
    );
  }
}

// -------------------------------------------------------------
// 1. DASHBOARD SCREEN (Overview & Daily/Weekly/Monthly History)
// -------------------------------------------------------------
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  ExpenseStats? _stats;
  SpendingHistory? _history;
  String _selectedPeriod = 'weekly';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final stats = await ApiService.fetchStats();
      final hist = await ApiService.fetchHistory(_selectedPeriod);
      setState(() {
        _stats = stats;
        _history = hist;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _changePeriod(String period) async {
    setState(() {
      _selectedPeriod = period;
      _isLoading = true;
    });
    try {
      final hist = await ApiService.fetchHistory(period);
      setState(() {
        _history = hist;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.attach_money, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            const Text('Apex Expense AI', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // KPI Cards Grid
                    if (_stats != null) ...[
                      Row(
                        children: [
                          Expanded(child: _buildKpiCard('Today', '\$${_stats!.todaySpend.toStringAsFixed(2)}', 'Avg: \$${_stats!.dailyAverage30d.toStringAsFixed(0)}/d', Colors.indigoAccent)),
                          const SizedBox(width: 10),
                          Expanded(child: _buildKpiCard('7 Days', '\$${_stats!.spent7d.toStringAsFixed(2)}', '${_stats!.weeklyDiffPct >= 0 ? '+' : ''}${_stats!.weeklyDiffPct}% vs last wk', const Color(0xFF10B981))),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(child: _buildKpiCard('30 Days', '\$${_stats!.spent30d.toStringAsFixed(2)}', 'Top: ${_stats!.topCategory}', const Color(0xFFEC4899))),
                          const SizedBox(width: 10),
                          Expanded(child: _buildKpiCard('Total Logged', '\$${_stats!.totalSpend.toStringAsFixed(0)}', '${_stats!.totalTransactions} total tx', Colors.cyan)),
                        ],
                      ),
                      const SizedBox(height: 20),
                    ],

                    // Timeframe Picker (Daily / Weekly / Monthly)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Spending History',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                                SegmentedButton<String>(
                                  segments: const [
                                    ButtonSegment(value: 'daily', label: Text('Day', style: TextStyle(fontSize: 12))),
                                    ButtonSegment(value: 'weekly', label: Text('Wk', style: TextStyle(fontSize: 12))),
                                    ButtonSegment(value: 'monthly', label: Text('Mo', style: TextStyle(fontSize: 12))),
                                  ],
                                  selected: {_selectedPeriod},
                                  onSelectionChanged: (val) => _changePeriod(val.first),
                                  style: ButtonStyle(
                                    visualDensity: VisualDensity.compact,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            if (_history != null && _history!.timeline.isNotEmpty) ...[
                              Text(
                                'Total: \$${_history!.totalSpent.toStringAsFixed(2)} (${_history!.totalTransactions} items)',
                                style: const TextStyle(color: Colors.white70, fontSize: 13),
                              ),
                              const SizedBox(height: 16),
                              // Visual bar chart
                              SizedBox(
                                height: 180,
                                child: _buildTimelineBarChart(_history!.timeline),
                              ),
                            ] else
                              const Text('No spending data for this period'),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Top Categories Card
                    if (_history != null && _history!.categoryBreakdown.isNotEmpty)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Top Spending Categories', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 12),
                              ..._history!.categoryBreakdown.take(5).map((cat) {
                                final amount = (cat['total'] as num).toDouble();
                                final pct = _history!.totalSpent > 0 ? (amount / _history!.totalSpent) : 0.0;
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(cat['category'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                                          Text('\$${amount.toStringAsFixed(2)}', style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      LinearProgressIndicator(
                                        value: pct,
                                        backgroundColor: Colors.white10,
                                        color: const Color(0xFF6366F1),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildKpiCard(String label, String value, String sub, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.6))),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 4),
            Text(sub, style: const TextStyle(fontSize: 11, color: Colors.white54), overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineBarChart(List<TimelineItem> items) {
    final maxTotal = items.map((e) => e.total).fold(1.0, (prev, val) => val > prev ? val : prev);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: items.map((item) {
        final heightRatio = (item.total / maxTotal).clamp(0.08, 1.0);
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 3),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  item.total > 999 ? '\$${(item.total / 1000).toStringAsFixed(1)}k' : '\$${item.total.toInt()}',
                  style: const TextStyle(fontSize: 9, color: Colors.white60),
                ),
                const SizedBox(height: 4),
                Container(
                  height: 120 * heightRatio,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [Color(0xFF4F46E5), Color(0xFF818CF8)],
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  item.label,
                  style: const TextStyle(fontSize: 9, color: Colors.white54),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

// -------------------------------------------------------------
// 2. PRODUCTS SCREEN (Full CRUD: Add, Edit, Remove, Search)
// -------------------------------------------------------------
class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  List<Product> _products = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    try {
      final prods = await ApiService.fetchProducts(search: _searchQuery);
      setState(() {
        _products = prods;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  void _openProductDialog({Product? product}) {
    final nameCtrl = TextEditingController(text: product?.name ?? '');
    final priceCtrl = TextEditingController(text: product?.defaultPrice.toString() ?? '');
    final unitCtrl = TextEditingController(text: product?.unit ?? 'item');
    final descCtrl = TextEditingController(text: product?.description ?? '');
    String category = product?.category ?? 'Groceries';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        title: Text(product == null ? 'Add New Product' : 'Edit Product'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Product Name *'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: priceCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Standard Price (\$) *'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: unitCtrl,
                decoration: const InputDecoration(labelText: 'Unit (e.g. bottle, item, kg)'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: descCtrl,
                decoration: const InputDecoration(labelText: 'Description'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () async {
              final name = nameCtrl.text.trim();
              final price = double.tryParse(priceCtrl.text) ?? 0.0;
              if (name.isEmpty || price <= 0) return;

              final data = {
                'name': name,
                'category': category,
                'default_price': price,
                'unit': unitCtrl.text.trim(),
                'description': descCtrl.text.trim(),
              };

              Navigator.pop(ctx);
              if (product == null) {
                await ApiService.createProduct(data);
              } else {
                await ApiService.updateProduct(product.id, data);
              }
              _loadProducts();
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteProduct(Product product) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        title: const Text('Remove Product?'),
        content: Text('Delete "${product.name}" from catalog? Past recorded spendings remain intact.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ApiService.deleteProduct(product.id);
      _loadProducts();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Product Catalog'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _openProductDialog(),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search products...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              ),
              onChanged: (val) {
                _searchQuery = val;
                _loadProducts();
              },
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _products.isEmpty
                    ? const Center(child: Text('No products found'))
                    : ListView.builder(
                        itemCount: _products.length,
                        itemBuilder: (ctx, i) {
                          final p = _products[i];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: const Color(0xFF6366F1).withValues(alpha: 0.2),
                                child: const Icon(Icons.shopping_bag, color: Color(0xFF6366F1)),
                              ),
                              title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('${p.category} • \$${p.defaultPrice.toStringAsFixed(2)} / ${p.unit}'),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit, size: 18),
                                    onPressed: () => _openProductDialog(product: p),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent),
                                    onPressed: () => _deleteProduct(p),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openProductDialog(),
        icon: const Icon(Icons.add),
        label: const Text('Add Product'),
      ),
    );
  }
}

// -------------------------------------------------------------
// 3. EXPENSES SCREEN (Ledger, Log Expense, Delete)
// -------------------------------------------------------------
class ExpensesScreen extends StatefulWidget {
  const ExpensesScreen({super.key});

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  List<Expense> _expenses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadExpenses();
  }

  Future<void> _loadExpenses() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService.fetchExpenses(limit: 100);
      setState(() {
        _expenses = list;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  void _openAddExpenseSheet() {
    final titleCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final merchantCtrl = TextEditingController();
    String category = 'Groceries';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Log New Expense', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Title *')),
            const SizedBox(height: 8),
            TextField(controller: amountCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Amount (\$) *')),
            const SizedBox(height: 8),
            TextField(controller: merchantCtrl, decoration: const InputDecoration(labelText: 'Merchant/Store')),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () async {
                  final title = titleCtrl.text.trim();
                  final amount = double.tryParse(amountCtrl.text) ?? 0.0;
                  if (title.isEmpty || amount <= 0) return;

                  await ApiService.createExpense({
                    'title': title,
                    'amount': amount,
                    'category': category,
                    'merchant': merchantCtrl.text.trim(),
                    'date': DateTime.now().toIso8601String(),
                  });

                  if (ctx.mounted) {
                    Navigator.pop(ctx);
                  }
                  _loadExpenses();
                },
                child: const Text('Record Expense'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final df = DateFormat('MMM dd, yyyy');
    return Scaffold(
      appBar: AppBar(
        title: const Text('Spending Ledger'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadExpenses),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _expenses.length,
              itemBuilder: (ctx, i) {
                final exp = _expenses[i];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  child: ListTile(
                    title: Text(exp.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${df.format(exp.date)} • ${exp.category} ${exp.merchant != null ? '(${exp.merchant})' : ''}'),
                    trailing: Text(
                      '\$${exp.amount.toStringAsFixed(2)}',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: Colors.white),
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openAddExpenseSheet,
        child: const Icon(Icons.add),
      ),
    );
  }
}

// -------------------------------------------------------------
// 4. AI CHATBOT ADVISOR SCREEN
// -------------------------------------------------------------
class AIChatScreen extends StatefulWidget {
  const AIChatScreen({super.key});

  @override
  State<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final List<Map<String, String>> _messages = [
    {
      'role': 'assistant',
      'content': '👋 Hello! I am your AI Financial Advisor. Ask me anything about your weekly or monthly spending, categories exceeding budget, or tips to optimize your expenses!'
    }
  ];
  final TextEditingController _inputCtrl = TextEditingController();
  bool _isLoading = false;

  final List<String> _quickChips = [
    'How much did I spend this week?',
    'Which categories are over budget?',
    'What are my highest expenses?',
    'Tips to save on dining & groceries'
  ];

  Future<void> _sendMessage(String query) async {
    if (query.trim().isEmpty || _isLoading) return;

    setState(() {
      _messages.add({'role': 'user', 'content': query.trim()});
      _isLoading = true;
    });
    _inputCtrl.clear();

    try {
      final res = await ApiService.sendChatMessage(query.trim());
      setState(() {
        _messages.add({'role': 'assistant', 'content': res['reply'] ?? 'Analyzed your spending records.'});
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _messages.add({'role': 'assistant', 'content': 'Error analyzing ledger: $e'});
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.smart_toy, color: Color(0xFF6366F1)),
            SizedBox(width: 8),
            Text('AI Financial Agent'),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: _messages.length,
              itemBuilder: (ctx, i) {
                final m = _messages[i];
                final isUser = m['role'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                    decoration: BoxDecoration(
                      color: isUser ? const Color(0xFF4F46E5) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: isUser ? null : Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      m['content'] ?? '',
                      style: TextStyle(
                        fontSize: 14,
                        color: isUser ? Colors.white : const Color(0xFF0F172A),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: LinearProgressIndicator(color: Color(0xFF4F46E5)),
            ),
          // Quick Chips
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              itemCount: _quickChips.length,
              itemBuilder: (ctx, i) {
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ActionChip(
                    backgroundColor: const Color(0xFFEEF2FF),
                    side: const BorderSide(color: Color(0xFFC7D2FE)),
                    label: Text(
                      _quickChips[i],
                      style: const TextStyle(fontSize: 12, color: Color(0xFF4338CA), fontWeight: FontWeight.w600),
                    ),
                    onPressed: () => _sendMessage(_quickChips[i]),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          // Input bar
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _inputCtrl,
                    style: const TextStyle(color: Color(0xFF0F172A)),
                    decoration: InputDecoration(
                      hintText: 'Ask about spendings, budgets...',
                      hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: const BorderSide(color: Color(0xFF4F46E5), width: 1.5)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                    onSubmitted: _sendMessage,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  style: IconButton.styleFrom(backgroundColor: const Color(0xFF4F46E5)),
                  icon: const Icon(Icons.send, color: Colors.white),
                  onPressed: () => _sendMessage(_inputCtrl.text),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
