'use client';

import { motion } from 'framer-motion';
import { Copy, CheckCircle, ChevronRight, Info, Terminal, Settings, UploadCloud, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaDocker } from 'react-icons/fa';
import { SiJenkins } from 'react-icons/si';
import { VscBeaker } from 'react-icons/vsc';
import { FaCloudUploadAlt } from 'react-icons/fa';

interface StaticContentProps {
  title: string;
  content: string;
  language?: string;
}

export function StaticContent({ title, content, language = 'dockerfile' }: StaticContentProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${title} copied to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy content');
    }
  };

  // Helper to render details with code blocks and lists
  function renderDetails(details: string) {
    if (!details) return null;
    // Render code blocks
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let codeMatch;
    let idx = 0;
    while ((codeMatch = codeBlockRegex.exec(details)) !== null) {
      if (codeMatch.index > lastIndex) {
        // Text before code
        parts.push(
          <div key={idx++} className="mb-2 whitespace-pre-line text-slate-300">
            {details.slice(lastIndex, codeMatch.index).trim()}
          </div>
        );
      }
      parts.push(
        <pre key={idx++} className="bg-slate-800 rounded p-3 text-xs text-slate-100 overflow-x-auto mb-2">
          {codeMatch[1].trim()}
        </pre>
      );
      lastIndex = codeBlockRegex.lastIndex;
    }
    if (lastIndex < details.length) {
      parts.push(
        <div key={idx++} className="mb-2 whitespace-pre-line text-slate-300">
          {details.slice(lastIndex).trim()}
        </div>
      );
    }
    return <>{parts}</>;
  }

  // Modern DevOps Guide rendering
  if (language === 'markdown' && title.toLowerCase().includes('guide') && content) {
    // Get the intro/heading if present
    const headingMatch = content.match(/\*\*Guide:([^\n]*)/i);
    const heading = headingMatch ? headingMatch[1].trim() : 'DevOps Setup Guide';

    // New: Parse intro and steps like '**Step 1:' or 'Step 1:'
    // Extract intro (text before first step)
    const stepPattern = /\*\*?Step (\d+):?\*\*?|Step (\d+):?/g;
    let intro = '';
    let steps = [];
    let lastIndex = 0;
    let match;
    let contentToParse = content.trim();
    // Find all step matches
    const stepMatches = [];
    while ((match = stepPattern.exec(contentToParse)) !== null) {
      stepMatches.push({
        index: match.index,
        number: match[1] || match[2],
      });
    }
    if (stepMatches.length) {
      intro = contentToParse.slice(0, stepMatches[0].index).trim();
      for (let i = 0; i < stepMatches.length; i++) {
        const start = stepMatches[i].index;
        const end = i + 1 < stepMatches.length ? stepMatches[i + 1].index : contentToParse.length;
        const stepBlock = contentToParse.slice(start, end).trim();
        // Extract heading (first line) and details (rest)
        const lines = stepBlock.split('\n').filter(Boolean);
        const heading = lines[0].replace(/\*\*?/g, '').trim();
        const details = lines.slice(1).join('\n').trim();
        steps.push({ number: stepMatches[i].number, heading, details });
      }
    }
    // If no steps found, fallback to previous logic
    if (!steps.length) {
      // Fallback: render as markdown (narrative or code block guide)
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle className="text-green-400 w-5 h-5 animate-bounce" />
              {heading}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-slate-400 hover:text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <div className="flex-1 p-6 bg-slate-900/50 prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      );
    }

    // Icon for each step (specific for DevOps)
    const devopsIcons = [
      <FaDocker key="docker" className="w-6 h-6" />,
      <SiJenkins key="jenkins" className="w-6 h-6" />,
      <VscBeaker key="test" className="w-6 h-6" />,
      <FaCloudUploadAlt key="deploy" className="w-6 h-6" />
    ];
    const devopsColors = [
      'from-blue-500 to-cyan-500',
      'from-yellow-500 to-orange-500',
      'from-green-500 to-lime-500',
      'from-purple-500 to-pink-500'
    ];

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700/50 bg-slate-800/30">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="text-green-400 w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
            <span className="hidden sm:inline">DevOps Setup Guide</span>
            <span className="sm:hidden">DevOps Guide</span>
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-slate-400 hover:text-white flex-shrink-0"
          >
            <Copy className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
        </div>
        <div className="flex-1 p-3 sm:p-6 bg-slate-900/50 overflow-auto">
          {intro && (
            <div className="mb-6 sm:mb-8 text-slate-300 text-sm sm:text-base animate-fade-in prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{intro}</ReactMarkdown>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.18 }}
                className={`rounded-xl shadow-lg bg-gradient-to-br ${devopsColors[i % devopsColors.length]} p-1`}
              >
                <div className="flex flex-col h-full bg-slate-900/90 rounded-xl p-3 sm:p-5">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 text-white text-lg sm:text-2xl font-bold shadow-lg">
                      {devopsIcons[i % devopsIcons.length]}
                    </span>
                    <span className="font-semibold text-base sm:text-lg text-white truncate">
                      {step.heading}
                    </span>
                    <span className="ml-auto px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/80 uppercase tracking-wider flex-shrink-0">
                      Step {i + 1}
                    </span>
                  </div>
                  <div className="text-slate-100 text-sm sm:text-base leading-5 sm:leading-6 prose prose-invert max-w-none animate-fade-in">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.details}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default rendering for other content
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700/50 bg-slate-800/30">
        <h2 className="text-base sm:text-lg font-semibold text-white truncate">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="text-slate-400 hover:text-white flex-shrink-0"
        >
          <Copy className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Copy</span>
        </Button>
      </div>
      <div className="flex-1 p-3 sm:p-6 bg-slate-900/50 overflow-auto">
        <motion.pre
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-100 font-mono text-xs sm:text-sm leading-5 sm:leading-6 whitespace-pre-wrap"
        >
          {content}
        </motion.pre>
      </div>
    </div>
  );
}

// Dockerfile content
export const dockerfileContent = `# Use Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \\
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:5000/api/health || exit 1

# Run the application
CMD ["python", "app.py"]`;

// Jenkinsfile content
export const jenkinsfileContent = `pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'launchbox-app'
        DOCKER_TAG = "\${BUILD_NUMBER}"
        REGISTRY = 'your-registry.com'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Test') {
            steps {
                script {
                    sh '''
                        python -m venv venv
                        source venv/bin/activate
                        pip install -r requirements.txt
                        python -m pytest tests/ --junitxml=test-results.xml
                    '''
                }
            }
            post {
                always {
                    junit 'test-results.xml'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("\${DOCKER_IMAGE}:\${DOCKER_TAG}")
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    sh '''
                        # Run security scan on Docker image
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
                            aquasec/trivy image \${DOCKER_IMAGE}:\${DOCKER_TAG}
                    '''
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry("https://\${REGISTRY}", 'registry-credentials') {
                        def image = docker.image("\${DOCKER_IMAGE}:\${DOCKER_TAG}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh '''
                        # Deploy to staging environment
                        kubectl set image deployment/launchbox-app \\
                            app=\${REGISTRY}/\${DOCKER_IMAGE}:\${DOCKER_TAG} \\
                            --namespace=staging
                        kubectl rollout status deployment/launchbox-app --namespace=staging
                    '''
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh '''
                        # Run integration tests against staging
                        python -m pytest integration_tests/ --base-url=https://staging.launchbox.ai
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                allOf {
                    branch 'main'
                    expression { return currentBuild.result == null || currentBuild.result == 'SUCCESS' }
                }
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                script {
                    sh '''
                        kubectl set image deployment/launchbox-app \\
                            app=\${REGISTRY}/\${DOCKER_IMAGE}:\${DOCKER_TAG} \\
                            --namespace=production
                        kubectl rollout status deployment/launchbox-app --namespace=production
                    '''
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "✅ Pipeline succeeded for \${env.JOB_NAME} - \${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "❌ Pipeline failed for \${env.JOB_NAME} - \${env.BUILD_NUMBER}"
            )
        }
    }
}`;

// DevOps Guide content
export const devopsGuideContent = `# 🚀 LaunchBox.AI DevOps Guide

## Overview
This guide will walk you through the complete DevOps pipeline for your project, from development to production deployment.

## 📋 Prerequisites
- Docker installed on your local machine
- Jenkins server (or CI/CD platform of choice)
- Kubernetes cluster (for production deployment)
- Container registry access (Docker Hub, AWS ECR, etc.)

## 🔧 Local Development Setup

### 1. Environment Setup
\`\`\`bash
# Clone your repository
git clone <your-repo-url>
cd your-project

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

### 2. Running Locally
\`\`\`bash
# Start the application
python app.py

# Application will be available at http://localhost:5000
\`\`\`

## 🐳 Docker Containerization

### 1. Build Docker Image
\`\`\`bash
# Build the image
docker build -t launchbox-app:latest .

# Run the container
docker run -p 5000:5000 launchbox-app:latest
\`\`\`

### 2. Docker Compose (Optional)
Create a \`docker-compose.yml\` for local development:
\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=development
    volumes:
      - .:/app
\`\`\`

## 🔄 CI/CD Pipeline

### 1. Jenkins Setup
- Install required plugins: Docker, Kubernetes, Git
- Configure credentials for registry and Kubernetes
- Create a new pipeline job pointing to your Jenkinsfile

### 2. Pipeline Stages
1. **Checkout**: Pull latest code from repository
2. **Test**: Run unit tests and generate reports
3. **Build**: Create Docker image
4. **Security Scan**: Scan for vulnerabilities
5. **Push**: Push image to registry
6. **Deploy Staging**: Deploy to staging environment
7. **Integration Tests**: Run end-to-end tests
8. **Deploy Production**: Manual approval + production deployment

## ☸️ Kubernetes Deployment

### 1. Deployment Manifest
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: launchbox-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: launchbox-app
  template:
    metadata:
      labels:
        app: launchbox-app
    spec:
      containers:
      - name: app
        image: your-registry/launchbox-app:latest
        ports:
        - containerPort: 5000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
\`\`\`

### 2. Service Manifest
\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: launchbox-app-service
spec:
  selector:
    app: launchbox-app
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
\`\`\`

## 📊 Monitoring & Observability

### 1. Health Checks
- Application exposes \`/api/health\` endpoint
- Kubernetes liveness and readiness probes configured
- Docker healthcheck included in Dockerfile

### 2. Logging
- Structured logging with JSON format
- Centralized log aggregation (ELK stack recommended)
- Log rotation and retention policies

### 3. Metrics
- Application metrics exposed via Prometheus
- Grafana dashboards for visualization
- Alerting rules for critical issues

## 🔒 Security Best Practices

### 1. Container Security
- Use non-root user in containers
- Scan images for vulnerabilities
- Keep base images updated
- Use multi-stage builds to reduce attack surface

### 2. Secrets Management
- Use Kubernetes secrets for sensitive data
- Rotate secrets regularly
- Never commit secrets to version control

### 3. Network Security
- Implement network policies
- Use TLS for all communications
- Regular security audits

## 🚀 Deployment Strategies

### 1. Blue-Green Deployment
- Zero-downtime deployments
- Quick rollback capability
- Full environment testing

### 2. Rolling Updates
- Gradual replacement of instances
- Configurable update strategy
- Automatic rollback on failure

### 3. Canary Deployments
- Test with small percentage of traffic
- Gradual traffic shifting
- Risk mitigation

## 📈 Scaling Considerations

### 1. Horizontal Pod Autoscaler
\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: launchbox-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: launchbox-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
\`\`\`

### 2. Database Scaling
- Read replicas for read-heavy workloads
- Connection pooling
- Database sharding for large datasets

## 🔧 Troubleshooting

### Common Issues
1. **Container won't start**: Check logs with \`docker logs <container-id>\`
2. **High memory usage**: Review resource limits and optimize code
3. **Slow response times**: Check database queries and add caching
4. **Deployment failures**: Verify image availability and resource quotas

### Debugging Commands
\`\`\`bash
# Check pod status
kubectl get pods

# View pod logs
kubectl logs <pod-name>

# Describe pod for events
kubectl describe pod <pod-name>

# Execute into running container
kubectl exec -it <pod-name> -- /bin/bash
\`\`\`

## 📚 Additional Resources
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Flask Deployment Options](https://flask.palletsprojects.com/en/2.0.x/deploying/)

---

**Need Help?** Contact the LaunchBox.AI team or check our documentation portal for more detailed guides.`;