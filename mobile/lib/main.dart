import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/auth_provider.dart';
import 'core/product_cache.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ProductCache.init();
  runApp(const RevoMartApp());
}

class RevoMartApp extends StatelessWidget {
  const RevoMartApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider()..loadSession(),
      child: MaterialApp(
        title: 'RevoMart',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF059669)),
          useMaterial3: true,
        ),
        home: const HomeScreen(),
      ),
    );
  }
}
