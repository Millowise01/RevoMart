import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:provider/provider.dart';
import '../core/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _localAuth = LocalAuthentication();

  Future<void> _biometricLogin() async {
    try {
      final can = await _localAuth.canCheckBiometrics;
      if (!can) return;
      final ok = await _localAuth.authenticate(
        localizedReason: 'Sign in to RevoMart',
        options: const AuthenticationOptions(biometricOnly: true),
      );
      if (ok && mounted) {
        await context.read<AuthProvider>().login(
          'customer@revomart.com',
          'Customer@123',
        );
        if (mounted) Navigator.pop(context);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Sign In'), backgroundColor: const Color(0xFF059669), foregroundColor: Colors.white),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            TextField(controller: _email, decoration: const InputDecoration(labelText: 'Email')),
            const SizedBox(height: 12),
            TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669), foregroundColor: Colors.white),
                onPressed: auth.loading
                    ? null
                    : () async {
                        await auth.login(_email.text, _password.text);
                        if (context.mounted) Navigator.pop(context);
                      },
                child: Text(auth.loading ? 'Signing in...' : 'Sign In'),
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _biometricLogin,
              icon: const Icon(Icons.fingerprint),
              label: const Text('Biometric Login'),
            ),
          ],
        ),
      ),
    );
  }
}
