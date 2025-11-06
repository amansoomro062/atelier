# Security Policy

## API Security Measures

Atelier implements several security measures to protect your API endpoints from abuse:

### 1. Rate Limiting

Both OpenAI and Anthropic API endpoints have rate limiting:
- **Limit**: 20 requests per minute per IP address
- **Window**: 60 seconds (rolling window)
- **Status Code**: 429 (Too Many Requests)

The rate limiting is tracked by IP address (using `x-forwarded-for` or `x-real-ip` headers).

**Note**: For production deployments, consider using a Redis-based rate limiter for better scalability across multiple instances.

### 2. Origin Checking (Production Only)

In production environments, the API endpoints only accept requests from:
- The same origin as your deployed application
- The URL specified in `NEXT_PUBLIC_APP_URL` environment variable

This prevents unauthorized websites from using your API as a proxy.

**Setup**:
```bash
# In your .env.local or deployment environment
NEXT_PUBLIC_APP_URL=https://atelier-prompt.vercel.app
```

**Status Code**: 403 (Forbidden) for unauthorized origins

### 3. Input Validation

All API endpoints validate incoming data:

| Input | Maximum Size/Count |
|-------|-------------------|
| System Prompt | 100,000 characters |
| User Prompt | 100,000 characters |
| Images | 10 images per request |
| Conversation History | 100 messages |

**Status Code**: 400 (Bad Request) for invalid inputs

### 4. API Key Security

- API keys are **never stored on the server**
- Keys are stored in browser localStorage
- Keys are sent with each request (client-to-server only)
- Keys are used directly to authenticate with OpenAI/Anthropic APIs
- Server acts as a pass-through proxy

**Important**: This is a Bring Your Own Key (BYOK) model. Users use their own API keys and are responsible for their API costs.

## Best Practices for Deployment

### Production Deployment Checklist

1. **Set Environment Variables**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://atelier-prompt.vercel.app
   NODE_ENV=production
   ```

2. **Enable HTTPS**: Always use HTTPS in production to protect API keys in transit

3. **Consider Additional Rate Limiting**: For high-traffic deployments, implement:
   - Redis-based rate limiting for distributed systems
   - Cloudflare or similar CDN with DDoS protection
   - API gateway with advanced rate limiting

4. **Monitor Abuse**: Set up logging and monitoring:
   - Track API usage patterns
   - Alert on unusual activity
   - Monitor rate limit triggers

5. **Add Authentication** (Future): Consider adding user authentication for:
   - Tracking individual user quotas
   - Preventing anonymous abuse
   - Managing user sessions

### Development Mode

Security measures are more relaxed in development:
- Origin checking is disabled
- Rate limits still apply
- Input validation still applies

This allows for easier local development and testing.

## Reporting Security Issues

If you discover a security vulnerability, please email security@atelier-prompt.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Do not** open a public issue for security vulnerabilities.

## Security Limitations

### Current Architecture

The current architecture has some inherent limitations:

1. **Client-Side Keys**: API keys are stored in browser localStorage
   - Users must trust their browser security
   - Keys could be accessed by browser extensions
   - Keys are sent over the network with each request

2. **Rate Limiting**: In-memory rate limiting
   - Resets on server restart
   - Not shared across multiple server instances
   - Can be bypassed by IP rotation (without additional measures)

3. **No User Authentication**: Anyone can access the application
   - No per-user quotas
   - No user-level tracking or billing

### Future Improvements (Roadmap)

Planned security enhancements:

1. **User Authentication** (Phase 3):
   - Login/signup with OAuth providers
   - Per-user API quotas
   - Session management

2. **Server-Side Key Management** (Optional):
   - Encrypted key storage
   - Key rotation
   - Revocation capabilities

3. **Advanced Rate Limiting**:
   - Redis-based distributed rate limiting
   - Per-user rate limits
   - Adaptive rate limiting based on usage patterns

4. **Audit Logging**:
   - Request logging
   - Usage analytics
   - Security event tracking

## Compliance

### Data Privacy

- **No Data Storage**: Atelier does not store prompts, responses, or API keys on the server
- **No Analytics**: No user tracking or analytics by default
- **Client-Side Processing**: All data stays in the user's browser

### GDPR Compliance

Since no user data is stored on servers:
- No personal data processing
- No data retention policies needed
- Users maintain full control of their data

### API Provider Terms

Users must comply with:
- [OpenAI Terms of Service](https://openai.com/policies/terms-of-use)
- [Anthropic Terms of Service](https://www.anthropic.com/legal/consumer-terms)

## Additional Security Headers

Consider adding these security headers in production:

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

## License

This security policy is part of the Atelier project and is licensed under MIT.
