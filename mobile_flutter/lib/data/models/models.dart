class Product {
  final int id;
  final String name;
  final String category;
  final double defaultPrice;
  final String unit;
  final String? description;
  final String? barcode;
  final bool isFavorite;

  Product({
    required this.id,
    required this.name,
    required this.category,
    required this.defaultPrice,
    required this.unit,
    this.description,
    this.barcode,
    this.isFavorite = false,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      category: json['category'],
      defaultPrice: (json['default_price'] as num).toDouble(),
      unit: json['unit'] ?? 'item',
      description: json['description'],
      barcode: json['barcode'],
      isFavorite: json['is_favorite'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'category': category,
      'default_price': defaultPrice,
      'unit': unit,
      'description': description,
      'barcode': barcode,
      'is_favorite': isFavorite,
    };
  }
}

class Expense {
  final int id;
  final int? productId;
  final String title;
  final String category;
  final double amount;
  final double quantity;
  final double unitPrice;
  final DateTime date;
  final String paymentMethod;
  final String? merchant;
  final String? notes;

  Expense({
    required this.id,
    this.productId,
    required this.title,
    required this.category,
    required this.amount,
    required this.quantity,
    required this.unitPrice,
    required this.date,
    required this.paymentMethod,
    this.merchant,
    this.notes,
  });

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'],
      productId: json['product_id'],
      title: json['title'],
      category: json['category'],
      amount: (json['amount'] as num).toDouble(),
      quantity: (json['quantity'] as num?)?.toDouble() ?? 1.0,
      unitPrice: (json['unit_price'] as num?)?.toDouble() ?? (json['amount'] as num).toDouble(),
      date: DateTime.parse(json['date']),
      paymentMethod: json['payment_method'] ?? 'Credit Card',
      merchant: json['merchant'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'category': category,
      'amount': amount,
      'quantity': quantity,
      'unit_price': unitPrice,
      'payment_method': paymentMethod,
      'merchant': merchant,
      'notes': notes,
      'product_id': productId,
      'date': date.toIso8601String(),
    };
  }
}

class ExpenseStats {
  final double todaySpend;
  final double spent7d;
  final double weeklyDiffPct;
  final double spent30d;
  final double monthlyDiffPct;
  final double totalSpend;
  final int totalTransactions;
  final double dailyAverage30d;
  final String topCategory;
  final double topCategoryAmount;

  ExpenseStats({
    required this.todaySpend,
    required this.spent7d,
    required this.weeklyDiffPct,
    required this.spent30d,
    required this.monthlyDiffPct,
    required this.totalSpend,
    required this.totalTransactions,
    required this.dailyAverage30d,
    required this.topCategory,
    required this.topCategoryAmount,
  });

  factory ExpenseStats.fromJson(Map<String, dynamic> json) {
    return ExpenseStats(
      todaySpend: (json['today_spend'] as num).toDouble(),
      spent7d: (json['spent_7d'] as num).toDouble(),
      weeklyDiffPct: (json['weekly_diff_pct'] as num).toDouble(),
      spent30d: (json['spent_30d'] as num).toDouble(),
      monthlyDiffPct: (json['monthly_diff_pct'] as num).toDouble(),
      totalSpend: (json['total_spend'] as num).toDouble(),
      totalTransactions: json['total_transactions'] ?? 0,
      dailyAverage30d: (json['daily_average_30d'] as num).toDouble(),
      topCategory: json['top_category'] ?? 'N/A',
      topCategoryAmount: (json['top_category_amount'] as num).toDouble(),
    );
  }
}

class TimelineItem {
  final String key;
  final String label;
  final double total;
  final int count;

  TimelineItem({
    required this.key,
    required this.label,
    required this.total,
    required this.count,
  });

  factory TimelineItem.fromJson(Map<String, dynamic> json) {
    return TimelineItem(
      key: json['key'] ?? '',
      label: json['label'] ?? '',
      total: (json['total'] as num).toDouble(),
      count: json['count'] ?? 0,
    );
  }
}

class SpendingHistory {
  final String period;
  final double totalSpent;
  final int totalTransactions;
  final List<TimelineItem> timeline;
  final List<Map<String, dynamic>> categoryBreakdown;

  SpendingHistory({
    required this.period,
    required this.totalSpent,
    required this.totalTransactions,
    required this.timeline,
    required this.categoryBreakdown,
  });

  factory SpendingHistory.fromJson(Map<String, dynamic> json) {
    var rawTimeline = json['timeline'] as List? ?? [];
    var items = rawTimeline.map((i) => TimelineItem.fromJson(i)).toList();
    var cats = (json['category_breakdown'] as List? ?? []).cast<Map<String, dynamic>>();

    return SpendingHistory(
      period: json['period'] ?? 'weekly',
      totalSpent: (json['total_spent'] as num).toDouble(),
      totalTransactions: json['total_transactions'] ?? 0,
      timeline: items,
      categoryBreakdown: cats,
    );
  }
}
