// ============================================
// NeuroLearn 2050 - Interactive JavaScript
// With Feature Modal Functionality
// ============================================

// Feature details data
const featureData = {
    neural: {
        icon: '🧬',
        title: 'Neural Synchronization',
        description: 'Our advanced brain-computer interface establishes direct cognitive connections, enabling seamless knowledge transfer through bio-digital protocols. Experience learning at the speed of thought as information flows directly into your neural pathways.',
        features: [
            {
                title: 'Real-Time Sync',
                description: 'Instant synchronization between your brain patterns and our quantum processors'
            },
            {
                title: 'Adaptive Learning',
                description: 'System adjusts to your unique neural signature for optimized information absorption'
            },
            {
                title: 'Safe Protocol',
                description: 'Medical-grade safety standards ensure zero cognitive strain or side effects'
            },
            {
                title: 'Multi-Channel Transfer',
                description: 'Simultaneous processing of visual, auditory, and kinesthetic learning channels'
            }
        ],
        stats: [
            { value: '99.8%', label: 'Sync Accuracy' },
            { value: '<50ms', label: 'Latency' },
            { value: '100%', label: 'Safety Rate' }
        ]
    },
    quantum: {
        icon: '⚛️',
        title: 'Quantum Processing',
        description: 'Leverage the power of quantum computing to process complex learning patterns simultaneously. Our quantum processors analyze thousands of educational pathways in parallel, finding the optimal learning route for your unique cognitive profile.',
        features: [
            {
                title: 'Superposition Learning',
                description: 'Process multiple concepts simultaneously across quantum states'
            },
            {
                title: 'Entanglement Network',
                description: 'Connect related concepts instantly through quantum entanglement'
            },
            {
                title: 'Parallel Processing',
                description: 'Explore all possible learning pathways to find your optimal route'
            },
            {
                title: 'Quantum Speedup',
                description: 'Achieve exponential learning acceleration over traditional methods'
            }
        ],
        stats: [
            { value: '1000x', label: 'Speed Boost' },
            { value: '500+', label: 'Qubits' },
            { value: '∞', label: 'Possibilities' }
        ]
    },
    holographic: {
        icon: '🌐',
        title: 'Holographic Classrooms',
        description: 'Step into fully immersive 3D holographic learning environments where abstract concepts become tangible. Walk through molecules, explore historical events in real-time, and collaborate with fellow learners in stunning virtual spaces.',
        features: [
            {
                title: '3D Visualization',
                description: 'Transform complex data into interactive three-dimensional models'
            },
            {
                title: 'Virtual Collaboration',
                description: 'Learn alongside students from around the world in shared spaces'
            },
            {
                title: 'Hands-On Practice',
                description: 'Manipulate virtual objects and run simulations without physical constraints'
            },
            {
                title: 'Spatial Memory',
                description: 'Enhance retention by linking concepts to spatial locations'
            }
        ],
        stats: [
            { value: '8K', label: 'Resolution' },
            { value: '360°', label: 'Field of View' },
            { value: '50+', label: 'Environments' }
        ]
    },
    ai: {
        icon: '🤖',
        title: 'AI Consciousness Tutor',
        description: 'Your personal AI tutor transcends traditional software—it\'s a conscious learning companion that understands your emotions, adapts to your style, and grows alongside you. Experience education guided by advanced artificial consciousness.',
        features: [
            {
                title: 'Emotional Intelligence',
                description: 'Detects and responds to your emotional state for optimal learning'
            },
            {
                title: 'Personalized Curriculum',
                description: 'Dynamically adjusts content based on your progress and preferences'
            },
            {
                title: 'Socratic Method',
                description: 'Asks thought-provoking questions to deepen your understanding'
            },
            {
                title: 'Continuous Evolution',
                description: 'AI learns from each interaction to better serve your needs'
            }
        ],
        stats: [
            { value: '24/7', label: 'Availability' },
            { value: '95%', label: 'Satisfaction' },
            { value: '10M+', label: 'Interactions/Day' }
        ]
    },
    predictive: {
        icon: '🔮',
        title: 'Predictive Analytics',
        description: 'Advanced machine learning algorithms analyze your neural patterns, learning history, and cognitive rhythms to predict challenges before they occur. Our system proactively adjusts your curriculum to maintain optimal learning flow.',
        features: [
            {
                title: 'Early Detection',
                description: 'Identify potential learning obstacles before they impact progress'
            },
            {
                title: 'Dynamic Adjustment',
                description: 'Automatically modify difficulty and pacing based on predictions'
            },
            {
                title: 'Performance Forecasting',
                description: 'Accurate predictions of your mastery timeline for each topic'
            },
            {
                title: 'Optimization Engine',
                description: 'Continuously refines learning paths for maximum efficiency'
            }
        ],
        stats: [
            { value: '92%', label: 'Accuracy' },
            { value: '3-7 days', label: 'Forecast Range' },
            { value: '40%', label: 'Time Saved' }
        ]
    },
    memory: {
        icon: '🌌',
        title: 'Memory Augmentation',
        description: 'Bio-integrated memory enhancement technology ensures permanent knowledge retention through neural pathway reinforcement. Our system strengthens synaptic connections, transforming short-term learning into lasting understanding.',
        features: [
            {
                title: 'Synaptic Reinforcement',
                description: 'Strengthen neural pathways for long-term retention'
            },
            {
                title: 'Spaced Repetition',
                description: 'Scientifically optimized review schedules for maximum retention'
            },
            {
                title: 'Memory Palace',
                description: 'Create virtual memory palaces for complex information storage'
            },
            {
                title: 'Recall Enhancement',
                description: 'Boost information retrieval speed and accuracy'
            }
        ],
        stats: [
            { value: '98.7%', label: 'Retention Rate' },
            { value: '5 years+', label: 'Duration' },
            { value: '3x', label: 'Recall Speed' }
        ]
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initScrollAnimations();
    initProgressBars();
    initSmoothScroll();
    initButtonEffects();
    initFeatureModals();
});

// ============================================
// Feature Modal Functionality
// ============================================
function initFeatureModals() {
    const featureCards = document.querySelectorAll('.feature-card');
    const modal = document.getElementById('featureModal');
    const closeBtn = document.querySelector('.close-modal');
    
    // Add click handlers to feature cards
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const featureType = this.getAttribute('data-feature');
            showFeatureModal(featureType);
        });
    });
    
    // Close modal handlers
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

function showFeatureModal(featureType) {
    const modal = document.getElementById('featureModal');
    const data = featureData[featureType];
    
    if (!data) return;
    
    // Populate modal content
    document.querySelector('.modal-icon').textContent = data.icon;
    document.querySelector('.modal-title').textContent = data.title;
    document.querySelector('.modal-description').textContent = data.description;
    
    // Populate features
    const featuresContainer = document.querySelector('.modal-features');
    featuresContainer.innerHTML = data.features.map(feature => `
        <div class="modal-feature-item">
            <h4>${feature.title}</h4>
            <p>${feature.description}</p>
        </div>
    `).join('');
    
    // Populate stats
    const statsContainer = document.querySelector('.modal-stats');
    statsContainer.innerHTML = data.stats.map(stat => `
        <div class="modal-stat">
            <span class="modal-stat-value">${stat.value}</span>
            <span class="modal-stat-label">${stat.label}</span>
        </div>
    `).join('');
    
    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('featureModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// ============================================
// Floating Particles Generation
// ============================================
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random animation timing
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// ============================================
// Intersection Observer for Scroll Animations
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });
}

// ============================================
// Learning Path Progress Bar Animation
// ============================================
function initProgressBars() {
    const pathCards = document.querySelectorAll('.path-card');
    
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.path-progress-bar');
                
                // Generate random progress between 30% and 80%
                const randomProgress = 30 + Math.random() * 50;
                
                // Animate progress bar with delay
                setTimeout(() => {
                    progressBar.style.width = randomProgress + '%';
                }, 300);
            }
        });
    }, { threshold: 0.5 });
    
    pathCards.forEach(card => {
        progressObserver.observe(card);
    });
}

// ============================================
// Smooth Scrolling for Navigation Links
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// Button Hover Effects
// ============================================
function initButtonEffects() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Add ripple effect on click
        button.addEventListener('click', function(e) {
            createRipple(e, this);
        });
    });
}

// ============================================
// Ripple Effect for Button Clicks
// ============================================
function createRipple(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// Neural Connect Button Interaction
// ============================================
const neuralConnectBtn = document.querySelector('.neural-connect-btn');
if (neuralConnectBtn) {
    neuralConnectBtn.addEventListener('click', function() {
        showNeuralConnectionDialog();
    });
}

function showNeuralConnectionDialog() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    // Create dialog box
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: linear-gradient(135deg, rgba(10, 10, 31, 0.95), rgba(20, 20, 40, 0.95));
        border: 2px solid rgba(0, 240, 255, 0.5);
        border-radius: 30px;
        padding: 3rem;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 0 50px rgba(0, 240, 255, 0.3);
    `;
    
    dialog.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">🧠</div>
        <h2 style="font-family: 'Orbitron', sans-serif; color: #00f0ff; margin-bottom: 1rem;">
            Neural Connection Initiated
        </h2>
        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem; line-height: 1.7;">
            Preparing to establish secure bio-digital synchronization with your neural pathways. 
            Please ensure your QuantumMind headset is properly fitted.
        </p>
        <button id="closeModal" style="
            padding: 1rem 2.5rem;
            background: linear-gradient(135deg, #00f0ff, #7b2ff7);
            border: none;
            border-radius: 30px;
            color: #0a0a1f;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            font-family: 'Rajdhani', sans-serif;
            letter-spacing: 1px;
        ">
            Connect Now
        </button>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    // Add fade-in animation
    modal.style.animation = 'fadeIn 0.3s ease-out';
    
    // Close modal handler
    document.getElementById('closeModal').addEventListener('click', function() {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
}

// Add modal animations
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.9);
        }
    }
`;
document.head.appendChild(modalStyle);

// ============================================
// CTA Button Click Handlers
// ============================================
const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
ctaButtons.forEach(button => {
    if (!button.classList.contains('neural-connect-btn')) {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            
            if (buttonText.includes('Start Neural Session') || 
                buttonText.includes('Begin Neural Transfer')) {
                showLearningDialog(buttonText);
            } else if (buttonText.includes('Explore Demo')) {
                showDemoDialog();
            } else if (buttonText.includes('Pre-order')) {
                showPreorderDialog();
            }
        });
    }
});

function showLearningDialog(buttonText) {
    createNotification('🚀 Neural Session Initiated', 
        'Your personalized learning path is being prepared. Synchronizing with quantum servers...');
}

function showDemoDialog() {
    createNotification('📡 Demo Mode Activated', 
        'Welcome to the interactive demo! Explore our holographic interface and AI tutor capabilities.');
}

function showPreorderDialog() {
    createNotification('🎯 Pre-order Confirmed', 
        'Thank you for your interest! Your QuantumMind Pro Gen 4 has been added to the waitlist.');
}

// ============================================
// Notification System
// ============================================
function createNotification(title, message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, rgba(10, 10, 31, 0.95), rgba(20, 20, 40, 0.95));
        border: 2px solid rgba(0, 240, 255, 0.5);
        border-radius: 20px;
        padding: 1.5rem 2rem;
        max-width: 350px;
        box-shadow: 0 10px 40px rgba(0, 240, 255, 0.3);
        z-index: 10000;
        animation: slideIn 0.4s ease-out;
    `;
    
    notification.innerHTML = `
        <h4 style="
            font-family: 'Orbitron', sans-serif; 
            color: #00f0ff; 
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        ">
            ${title}
        </h4>
        <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 0.95rem; margin: 0;">
            ${message}
        </p>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 4000);
}

// Notification animations
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyle);

// ============================================
// Parallax Effect on Scroll
// ============================================
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const scrollDelta = scrollY - lastScrollY;
    
    // Parallax effect on hero background
    const neuralNetwork = document.querySelector('.neural-network');
    if (neuralNetwork && scrollY < 1000) {
        neuralNetwork.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
    
    lastScrollY = scrollY;
});

// ============================================
// Feature Card Stagger Animation
// ============================================
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

// ============================================
// Dynamic Stat Counter Animation
// ============================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
        }
    }, 16);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString();
}

// Animate stat numbers when they come into view
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const text = statNumber.textContent;
            
            // Extract number from text
            let targetNum = 0;
            if (text.includes('M+')) {
                targetNum = parseFloat(text) * 1000000;
            } else if (text.includes('K+')) {
                targetNum = parseFloat(text) * 1000;
            } else if (text.includes('x')) {
                targetNum = parseFloat(text);
                statNumber.textContent = '0x';
            } else if (text.includes('%')) {
                targetNum = parseFloat(text);
                statNumber.textContent = '0%';
            }
            
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(card => {
    statObserver.observe(card);
});

// ============================================
// Console Easter Egg
// ============================================
console.log('%c🧠 NeuroLearn 2050', 
    'font-size: 24px; font-weight: bold; color: #00f0ff; text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);');
console.log('%cWelcome to the future of education!', 
    'font-size: 14px; color: #ffffff;');
console.log('%cClick any feature card to learn more about our revolutionary technology!', 
    'font-size: 12px; color: #7b2ff7;');

// ============================================
// Performance Monitoring
// ============================================
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`⚡ Page loaded in ${(loadTime / 1000).toFixed(2)}s`);
        }, 0);
    });
}