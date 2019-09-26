var documenterSearchIndex = {"docs":
[{"location":"#NeuralQuantum.jl-1","page":"Home","title":"NeuralQuantum.jl","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"A Neural-Network steady-state solver","category":"page"},{"location":"#","page":"Home","title":"Home","text":"NeuralQuantum.jl is a numerical framework written in Julia to investigate Neural-Network representations of mixed quantum states and to find the Steady-State of such NonEquilibrium Quantum Systems by MonteCarlo sampling.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"note: Note\nPlease note that the code is research code and is not production ready, yet.","category":"page"},{"location":"#Installation-1","page":"Home","title":"Installation","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"To install NeuralQuantum, run in a Julia prompt the following command.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"] add QuantumOptics#master\n] add https://github.com/PhilipVinc/QuantumLattices.jl\n] add https://github.com/PhilipVinc/ValueHistoriesLogger.jl\n] add https://github.com/PhilipVinc/NeuralQuantum.jl","category":"page"},{"location":"#Basic-Usage-1","page":"Home","title":"Basic Usage","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"CurrentModule = NeuralQuantum","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Once one has a Liouvillian problem of which one wants to compute the steady state, the underlaying idea of the package is the following:","category":"page"},{"location":"#","page":"Home","title":"Home","text":"One selects a Neural-Network based ansatz to approximate the density matrix (see Sec. Networks);\nOne choses the algorithm to compute the gradient with which to minimise the objective function (see Sec. Algorithms);\nOne choses an optimizer to perform the optimization, such as steepest gradient, accelerated gradient or others (see Sec. Optimizers);","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Here you can find a very short usage example. For a more in-depth walkthrough of NeuralQuantum.jl please refer to Sec. Basics.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"# Load dependencies\nusing NeuralQuantum, QuantumLattices\nusing Printf, ValueHistoriesLogger, Logging, ValueHistories\n\n# Select the numerical precision\nT      = Float64\n# Select how many sites you want\nNsites = 6\n\n# Create the lattice as [Nx, Ny, Nz]\nlattice = SquareLattice([Nsites],PBC=true)\n# Create the lindbladian for the QI model\nlind = quantum_ising_lind(lattice, g=1.0, V=2.0, γ=1.0)\n# Create the Problem (cost function) for the given lindbladian\n# alternative is LdagL_L_prob. It works for NDM, not for RBM\nprob = LdagL_spmat_prob(T, lind);\n\n#-- Observables\n# Define the local observables to look at.\nSx  = QuantumLattices.LocalObservable(lind, sigmax, Nsites)\nSy  = QuantumLattices.LocalObservable(lind, sigmay, Nsites)\nSz  = QuantumLattices.LocalObservable(lind, sigmaz, Nsites)\n# Create the problem object with all the observables to be computed.\noprob = ObservablesProblem(Sx, Sy, Sz)\n\n\n# Define the Neural Network. A NDM with N visible spins and αa=2 and αh=1\n#alternative vectorized rbm: net  = RBMSplit(Complex{T}, Nsites, 6)\nnet  = rNDM(T, Nsites, 1, 2)\n# Create a cached version of the neural network for improved performance.\ncnet = cached(net)\n# Chose a sampler. Options are FullSumSampler() which sums over the whole space\n# ExactSampler() which does exact sampling or MCMCSamler which does a markov\n# chain.\n# This is a markov chain of length 1000 where the first 50 samples are trashed.\nsampl = MCMCSampler(Metropolis(), 1000, burn=50)\n# Chose a sampler for the observables.\nosampl = FullSumSampler()\n\n# Chose the gradient descent algorithm (alternative: Gradient())\n# for more information on options type ?SR\nalgo  = SR(ϵ=T(0.01), use_iterative=true)\n# Optimizer: how big the steps of the descent should be\noptimizer = Optimisers.Descent(0.02)\n\n# Create a multithreaded Iterative Sampler.\nis = MTIterativeSampler(cnet, sampl, prob, algo)\nois = MTIterativeSampler(cnet, osampl, oprob, oprob)\n\n# Create the logger to store all output data\nlog = MVLogger()\n\n# Solve iteratively the problem\nwith_logger(log) do\n    for i=1:50\n        # Sample the gradient\n        grad_data  = sample!(is)\n        obs_data = sample!(ois)\n\n        # Logging\n        @printf \"%4i -> %+2.8f %+2.2fi --\\t \\t-- %+2.5f\\n\" i real(grad_data.L) imag(grad_data.L) real(obs_data.ObsAve[1])\n        @info \"\" optim=grad_data obs=obs_data\n\n        succ = precondition!(cnet.der.tuple_all_weights, algo , grad_data, i)\n        !succ && break\n        Optimisers.update!(optimizer, cnet, cnet.der)\n    end\nend\n\n# Optional: compute the exact solution\nρ   = last(steadystate.master(lind)[2])\nESx = real(expect(SparseOperator(Sx), ρ))\nESy = real(expect(SparseOperator(Sy), ρ))\nESz = real(expect(SparseOperator(Sz), ρ))\nexacts = Dict(\"Sx\"=>ESx, \"Sy\"=>ESy, \"Sz\"=>ESz)\n## - end Optional\n\nusing Plots\ndata = log.hist\n\niter_cost, cost = get(data[\"optim/Loss\"])\npl1 = plot(iter_cost, real(cost), yscale=:log10);\n\niter_mx, mx = get(data[\"obs/obs_1\"])\npl2 = plot(iter_mx, mx);\nhline!(pl2, [ESx,ESx]);\n\nplot(pl1, pl2, layout=(2,1))\n...","category":"page"},{"location":"#Table-Of-Contents-1","page":"Home","title":"Table Of Contents","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"","category":"page"},{"location":"#Main-Functions-1","page":"Home","title":"Main Functions","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"solve","category":"page"},{"location":"#","page":"Home","title":"Home","text":"ExactSamplerCache","category":"page"},{"location":"#Index-1","page":"Home","title":"Index","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"","category":"page"},{"location":"basics/#Basics-1","page":"Basics","title":"Basics","text":"","category":"section"},{"location":"basics/#Setting-up-the-problem-1","page":"Basics","title":"Setting up the problem","text":"","category":"section"},{"location":"basics/#","page":"Basics","title":"Basics","text":"NeuralQuantum's aim is to compute the steady state of an Open Quantum System. As such, the first step must be defining the elements that make up the lindbladaian, namely the Hilbert space, the Hamiltonian and the Loss operators.","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"While it is possible to specify an arbitrary quantum system, the easiest way is to use one of the alredy-implemented systems. ","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"using NeuralQuantum\n\nNspins = 5 # The number of spins in the system\n\n# Compute the Hamiltonian and the list of jump operators.\nsys = quantum_ising_system(Nspins, V=0.2, g=1.0, gamma=0.1, PBC=true)","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"Next, we need to define the quantity that we wish to minimize variationally to find the steady state. This will be langlerhomathcalL^daggermathcalL rhorangle. I call this quantity the problem.","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"prob = LdagLProblem(sys, compute_ss=false)","category":"page"},{"location":"basics/#Choosing-the-Ansatz-1","page":"Basics","title":"Choosing the Ansatz","text":"","category":"section"},{"location":"basics/#","page":"Basics","title":"Basics","text":"The next step consists in creating the network-based ansatz for the density matrix. In this example we will use a 64-bit floating point precision translational invariant Neural Density Matrix, with N_textspins spins in the visible layer, 3 features in the hidden layer (~ 3N_textspins spins) and 3 features in the ancilla. To increase the expressive power of the network, one may increase freely the number of features. For a complete list of all possible ansatzes refer to section Networks.","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"net_initial = TINDM{Float64}(Nspins, 3, 3)","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"When you create a network, it has all it's weights initialized to zero. It is usually a good idea to initialize them to some gaussian distribution. of width 01. Often, in the machine learning community, they are initialized according to a uniform distribution between -frac1sqrtN frac1sqrtN [ref?].","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"# Load the package with random numbers\nusing Random\n\n# For reproducible results, choose a seed\nrng = MersenneTwister(12345)\n\n# Initialize the weights according to a gaussian distribution of width 1\nrandn!(rng, net_initial.weights)\n\n# Set the width to 0.3\nnet_initial.weights .*= 0.3","category":"page"},{"location":"basics/#Solving-for-the-steady-state-1","page":"Basics","title":"Solving for the steady state","text":"","category":"section"},{"location":"basics/#","page":"Basics","title":"Basics","text":"Having specified the quantity to minimize and the ansatz, we only need to choose the sampler and the optimization scheme.","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"The sampler is the algorithm that selects the states in the hilbert space to be summed over. Options are Exact, which performs an exact sum over all possible vectors in the hilbert space, ExactDistrib, which samples a certain number of elements according to the exact distribution, and Metropolis, which performs a Markov Chain according to the Metropolis rule. For this example we will chose an exact sum over all the hilbert space.","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"The Optimizer is instead the algorithm that, given the gradient, updates the variational weights of the ansatz. In this example we will use a simple gradient descent scheme with step size lr=0.01. Many more optimizers are described in Sec. Optimizers.","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"# Initialize an Exact Sum Sampler\nsampler = Exact()\n\n# Initialize a GD optimizer with learning rate (step size) 0.01\noptim = GD(lr=0.1)\n\n# Optimize the weights of the neural network for 100 iterations\nsol = solve(net_initial, prob, sampling_alg=sampler, optimizer=optim, max_iter=100)","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"After running the solve command you should see in the temrinal a list of the loss function updating over time, and how much it varies across iterations, such as this:","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"  iter -> E= <rho| LdagL |rho>/<rho|rho>     → ΔE = variation since last iter\n     3 -> E=(+7.199784e-01 +im+8.558472e-18) → ΔE = -1.20e-01\n     4 -> E=(+6.173014e-01 +im-5.918733e-18) → ΔE = -1.03e-01\n     5 -> E=(+4.952037e-01 +im-5.480910e-18) → ΔE = -1.22e-01","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"If the optimization goes well, ΔE should almost always be negative as to converge towards the minimum.","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"## The solution object The solve command returns a structure holding several important data:","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"sol.net_initial stores the initial configuration of the network\nsol.net_end stores the configuration of the network at the end of the optimization\nsol.data stores the data of the observables and other quantities of interest","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"To access, for example, the value of langlerhomathcalL^daggermathcalL rhorangle along the optimization, one can simply do","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"sol[:Energy].iterations\nsol[:Energy].values","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"where iterations is a vector containing the information at which iterations the corresponding value was logged.","category":"page"},{"location":"basics/#Logging-observables-during-the-evolution-1","page":"Basics","title":"Logging observables during the evolution","text":"","category":"section"},{"location":"basics/#","page":"Basics","title":"Basics","text":"It can be usefull to store also some other observables during the evolution. To do so, one can pass additional keyword-arguments to the solve command:","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"observables: A list of tuples, containing the observables and a symbol to name it, such as","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"[(:obs1, obs1), (:obs2, obs2)]","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"log_skip_steps, an integer specifing every how many iterations the observable should be computed\nlog_weights saves the weights.\nlog_fidelity, logs the fidelity of the state w.r.t the target state. WARNING:","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"computing the fidelity is a very computationally demanding task, and as such you    should not usually use this feature","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"For example, to store the observables m_x, m_y and m_z  every 2 optimization step, we can do the following:","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"# Compute the operator for the average magnetization\nmx, my, mz = magnetization([:x, :y, :z], sys)./Nspins\n\n# Create the list of observables and symbols\nobs = [(:mx, mx), (:my, my), (:mz, mz)];\n\n# Create the logger\nsol = solve(net_initial, prob, max_iter=100, observables=obs, save_at=2)","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"The magnetization([::Symbols], ::System) function returns the total magnetization operator along the specified axis for the given system. For more information on this function refer to Systems.","category":"page"},{"location":"basics/#Using-the-Logger-1","page":"Basics","title":"Using the Logger","text":"","category":"section"},{"location":"basics/#","page":"Basics","title":"Basics","text":"Once you have solution, you can plot it with:","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"using Plots\n\npl_E = plot(sol[:Energy])\npl_x = plot(sol[:mx])\npl_y = plot(sol[:my])\npl_z = plot(sol[:mz])\npl(pl_E, pl_x, pl_y, pl_z)","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"Quantities inside the logger are stored as :","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"sol[:OBSERVABLE].iterations ->\nsol[:OBSERVABLE].values     ->","category":"page"},{"location":"basics/#","page":"Basics","title":"Basics","text":"You can also concatenate several different solutions. This will return a MVHistory object holding the evolution of all quantities of interest and observables, but it won't hold anymore information on the weights.","category":"page"},{"location":"basics/#Summary-1","page":"Basics","title":"Summary","text":"","category":"section"},{"location":"basics/#","page":"Basics","title":"Basics","text":"using NeuralQuantum, Random\n\nNspins = 5 # The number of spins in the system\n\n# Compute the Hamiltonian and the list of jump operators.\nsys = quantum_ising_system(Nspins, V=0.2, g=1.0, gamma=0.1, PBC=true)\n\n# Compute the operator for the average magnetization\nmx, my, mz = magnetization([:x, :y, :z], sys)./Nspins\n\n# Create the list of observables and symbols\nobs = [(:mx, mx), (:my, my), (:mz, mz)];\n\n# Define the quantity to be minimised (the loss function)\nprob = LdagLProblem(sys, compute_ss=false)\n\n# Translational-Invariant Neural Density Matrix with 3 hidden, 3 auxiliary features\n# and Binary activation function.\nnet_initial = TINDMBinaryExact{Float64}(Nspins, 3, 3)\n\n# For reproducible results, choose a seed\nrng = MersenneTwister(12345)\n\n# Initialize the weights according to a gaussian distribution of width 1\nrandn!(rng, net_initial.weights)\n\n# Set the width to 0.3\nnet.weights .*= 0.3\n\n# Initialize an Exact Sum Sampler\nsampler = Exact()\n\n# Initialize a GD optimizer with learning rate (step size) 0.01\noptim = GD(lr=0.1)\n\n# Optimize the weights of the neural network for 100 iterations\nnet_optimized = solve(net_initial, prob, sampling_alg=sampler, optimizer=optim,\n                      max_iter=100, observables=obs, save_at=1)","category":"page"},{"location":"problems/#Problems-1","page":"Problems","title":"Problems","text":"","category":"section"},{"location":"problems/#","page":"Problems","title":"Problems","text":"A Problem is the structure representing the problem that must be solved, such as the minimization of the cost function to determine the steady state. Currently only problems representing the computation of the steady state by minimization of the cost function mathcalL^daggermathcalL are supported.","category":"page"},{"location":"problems/#Minimization-of-\\mathcal{C}-\\langle\\langle\\mathcal{L}\\dagger\\mathcal{L}\\rangle\\rangle-1","page":"Problems","title":"Minimization of mathcalC = langlelanglemathcalL^daggermathcalLranglerangle","text":"","category":"section"},{"location":"problems/#","page":"Problems","title":"Problems","text":"This cost function can be computed in two ways:","category":"page"},{"location":"problems/#","page":"Problems","title":"Problems","text":"mathcalC = sum_sigma p(sigma) langlelanglesigma mathcalL^daggermathcalLrhoranglerangle","category":"page"},{"location":"problems/#","page":"Problems","title":"Problems","text":"or","category":"page"},{"location":"problems/#","page":"Problems","title":"Problems","text":"mathcalC = sum_sigma p(sigma) langlelanglesigma mathcalLrhoranglerangle^2","category":"page"},{"location":"problems/#","page":"Problems","title":"Problems","text":"The second version leads to smaller variance of sampled variables and also is faster to evaluate because it holds only mathcalL instead of mathcalL^daggermathcalL, as such I reccomend to use this one.","category":"page"},{"location":"problems/#","page":"Problems","title":"Problems","text":"LdagL_Lmat_prob\n\nLdagL_spmat_prob","category":"page"},{"location":"problems/#NeuralQuantum.LdagL_Lmat_prob","page":"Problems","title":"NeuralQuantum.LdagL_Lmat_prob","text":"LdagL_Lmat_prob <: Problem\n\nProblem or finding the steady state of a ℒdagℒ matrix by computing 𝒞 = ∑|ρ(σ)|²|⟨⟨σ|ℒ |ρ⟩⟩|² only storing H and c_ops.\n\nDO NOT USE WITH COMPLEX-WEIGHT NETWORKS, AS IT DOES NOT WORK\n\n\n\n\n\n","category":"type"},{"location":"problems/#NeuralQuantum.LdagL_spmat_prob","page":"Problems","title":"NeuralQuantum.LdagL_spmat_prob","text":"LdagL_spmat_prob <: Problem\n\nProblem or finding the steady state of a ℒdagℒ matrix\n\n\n\n\n\n","category":"type"},{"location":"algorithms/#Algorithms-1","page":"Algorithms","title":"Algorithms","text":"","category":"section"},{"location":"algorithms/#","page":"Algorithms","title":"Algorithms","text":"An algorithm specifies how the loss function is minimised.","category":"page"},{"location":"algorithms/#","page":"Algorithms","title":"Algorithms","text":"We support two types of algorithms: a trivial Gradient Descent and the more sophisticated Stochastic Reconfiguration method.","category":"page"},{"location":"algorithms/#","page":"Algorithms","title":"Algorithms","text":"Gradient\nSR","category":"page"},{"location":"algorithms/#NeuralQuantum.SR","page":"Algorithms","title":"NeuralQuantum.SR","text":"SR([use_iterative=true, ϵ=0.001, λ0=100, b=0.95, λmin=1e-4, precondition_type=sr_shift)\n\nStochastic Reconfiguration preconditioner which corrects the gradient according to the natural gradient computed as S^-1 ∇C. Using this algorithm will lead to the computation of the S matrix together with the gradient of the cost function ∇C. To compute the natural gradient S^-1∇C an iterative scheme (Minres-QLP) or a direct inversion is used.\n\nIf use_iterative=true the inverse matrix S^-1 is not computed, and an iterative MINRES-QLP algorithm is used to compute the product S^-1*F\n\nIf precondition_type=sr_shift then a diagonal uniform shift is added to S S –> S+ϵ*identity\n\nIf precondition_type=sr_multiplicative then a diagonal multiplicative shift is added to S S –> S + max(λ0b^n,λmin)Diagonal(diag(S)) where n is the number of the iteration.\n\n\n\n\n\n","category":"type"},{"location":"networks/#Networks-1","page":"Networks","title":"Networks","text":"","category":"section"},{"location":"networks/#","page":"Networks","title":"Networks","text":"In general, given an Hilbert space mathcalH with basis vecsigmainmathcalH, a density matrix defined on this space lives in the space of the Bounded Operators mathcalB with (overcomplete) basis (sigma tildesigma ) in mathcalHotimesmathcalH.  A network is a (high-dimensional non-linear) function","category":"page"},{"location":"networks/#","page":"Networks","title":"Networks","text":"rho(sigma tildesigma W)","category":"page"},{"location":"networks/#","page":"Networks","title":"Networks","text":"depending on the variational parameters W, and on the entries of the density matrix labelled by (sigma tildesigma).","category":"page"},{"location":"networks/#Usage-1","page":"Networks","title":"Usage","text":"","category":"section"},{"location":"networks/#","page":"Networks","title":"Networks","text":"There are currently three implemented networks:","category":"page"},{"location":"networks/#Neural-Density-Matrix-1","page":"Networks","title":"Neural Density Matrix","text":"","category":"section"},{"location":"networks/#","page":"Networks","title":"Networks","text":"Torlai et Melko PRL 2019","category":"page"},{"location":"networks/#","page":"Networks","title":"Networks","text":"A real-valued neural network to describe a positive-semidefinite matrix. Complex numbers are generated by duplicating the structure of the network, and using one to generate the modulus and the other to generate the phase. See the article for details.","category":"page"},{"location":"networks/#","page":"Networks","title":"Networks","text":"","category":"page"},{"location":"optimizers/#Optimizers-1","page":"Optimizers","title":"Optimizers","text":"","category":"section"},{"location":"optimizers/#","page":"Optimizers","title":"Optimizers","text":"An optimizer is a routine designed to update some parameters W using a gradient ∇ according to some formula. An optimizer is always needed when solving for the steady state of a Density Matrix.","category":"page"},{"location":"optimizers/#","page":"Optimizers","title":"Optimizers","text":"The most basic type of Optimizer is the Steepest-Gradient-Descent ( also known as Stochastic Gradient Descent - SGD ), which updates the weights W_i following the gradient nabla = nabla_W E, computed as the gradient of the objective function E against the parameters W. The update formula is:","category":"page"},{"location":"optimizers/#","page":"Optimizers","title":"Optimizers","text":"W_i+1 = W_i - epsilon nabla","category":"page"},{"location":"optimizers/#","page":"Optimizers","title":"Optimizers","text":"where the only parameter of the optimizer (hyperparameter, in Machine-Learning jargon) is the step size epsilon.","category":"page"},{"location":"optimizers/#","page":"Optimizers","title":"Optimizers","text":"There exist some way to improve upon this formula, for example by including momentum and friction, obtaining the Momentum Gradient Descent.","category":"page"},{"location":"optimizers/#Types-of-Optimizers-1","page":"Optimizers","title":"Types of Optimizers","text":"","category":"section"},{"location":"optimizers/#Gradient-Descent-(GD)-1","page":"Optimizers","title":"Gradient Descent (GD)","text":"","category":"section"},{"location":"optimizers/#","page":"Optimizers","title":"Optimizers","text":"GD","category":"page"},{"location":"optimizers/#Gradient-Descent-with-Corrected-Momentum-(NesterovGD)-1","page":"Optimizers","title":"Gradient Descent with Corrected Momentum (NesterovGD)","text":"","category":"section"},{"location":"optimizers/#","page":"Optimizers","title":"Optimizers","text":"NesterovGD","category":"page"},{"location":"states/#State-abstract-type-1","page":"States","title":"State abstract type","text":"","category":"section"},{"location":"states/#","page":"States","title":"States","text":"State is the base abstract type which must be subtyped for the elements that span an hilbert space (or a Matrix space), and which also correspond to a configuration of the visible layer of the neural network.","category":"page"},{"location":"states/#Defining-a-new-State-concrete-struct-1","page":"States","title":"Defining a new State concrete struct","text":"","category":"section"},{"location":"states/#","page":"States","title":"States","text":"It is possible that one wants to define a new type of state, which spans the density matrix space in a different way and gives a correspondence between visible layer configurations and elements in the density matrix in a novel way. To do so, one must take care of defining the following ingredients:     - The mutable struct holding the state itself;     - Accessor methods that can be used by the sampler and the problem to compute     observables;     - Methods for modyfing the state;     - (optionally) constructors.","category":"page"},{"location":"states/#","page":"States","title":"States","text":"a State derivating from DualValuedState must define the following:","category":"page"},{"location":"states/#","page":"States","title":"States","text":"mutable struct ExampleState <: DualValuedState\n\t...\n\t...\nend","category":"page"},{"location":"states/#Constructors-1","page":"States","title":"Constructors","text":"","category":"section"},{"location":"states/#","page":"States","title":"States","text":"No default constructor must be created by itself, because it will be called from specific code of every NeuralNetwork. Though, the standard interface would require to define","category":"page"},{"location":"states/#","page":"States","title":"States","text":"ExampleState{...}({number params}, {Ints })","category":"page"},{"location":"states/#","page":"States","title":"States","text":"where number params are all parameters listing the length of the various items in the ExampleState, and {Ints} are the ints that initialize them.","category":"page"},{"location":"states/#Accessors-1","page":"States","title":"Accessors","text":"","category":"section"},{"location":"states/#","page":"States","title":"States","text":"To define a new state, all those accessors must be defined:","category":"page"},{"location":"states/#","page":"States","title":"States","text":"spacedimension(state::ExampleState) returning the size of the space where this state lives. For example, for N spins this will be 2^N\nhalf_space_dimension(state::ExampleState) returns the size of the physical hilbert space where the density matrix is defined. Usually 2^(N/2)\ntoint(state::ExampleState) returning the state expressed as an integer\nnsites(state::ExampleState) returns the number of sites where this state is defined.\nvectorindex(state::ExampleState) ????\nneurontype(state::ExampleState) returning the type of the neuron for this state\nneurontype(::Type{ExampleState}) returning the type of the neuron for this state.","category":"page"},{"location":"states/#Operations-1","page":"States","title":"Operations","text":"","category":"section"},{"location":"states/#","page":"States","title":"States","text":"flipat!(state, i::Integer)\nset!(state, i::Integer)\nadd!(State, i::Integer)\n`setzero!(state)","category":"page"}]
}
